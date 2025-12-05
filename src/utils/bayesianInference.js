/**
 * Bayesian Network Inference Utilities
 *
 * This module implements basic Bayesian inference for a directed acyclic graph (DAG)
 * following principles from Judea Pearl's work on causal inference.
 */

/**
 * Calculate the posterior probability of a node given its parents
 * using the conditional probability from incoming edges
 *
 * @param {Object} node - The node to calculate probability for
 * @param {Array} parentNodes - Array of parent nodes
 * @param {Array} edges - Array of edges connecting parents to this node
 * @returns {number} - Updated probability for the node
 */
export function calculateNodeProbability(node, parentNodes, edges) {
  // If no parents, return the prior probability
  if (!parentNodes || parentNodes.length === 0) {
    return node.data?.probability ?? 0.5
  }

  // Check if node uses CPT (Conditional Probability Table)
  if (node.data?.useCPT && node.data?.cpt) {
    return calculateProbabilityWithCPT(node, parentNodes)
  }

  // Otherwise, use noisy-OR model
  // P(child | parents) = 1 - ∏(1 - P(parent) * P(edge))
  // This is a common approximation in Bayesian networks

  let product = 1.0

  parentNodes.forEach(parent => {
    // Find the edge from this parent to the current node
    const edge = edges.find(
      e => e.source === parent.id && e.target === node.id
    )

    if (edge) {
      const parentProb = parent.data?.probability ?? 0.5
      const edgeProb = edge.data?.probability ?? 0.5

      // Noisy-OR: contribution of this parent
      product *= (1 - parentProb * edgeProb)
    }
  })

  return 1 - product
}

/**
 * Calculate probability using Conditional Probability Table
 * Uses exact inference by marginalizing over all parent state combinations
 *
 * @param {Object} node - The node with CPT data
 * @param {Array} parentNodes - Array of parent nodes
 * @returns {number} - Calculated probability
 */
function calculateProbabilityWithCPT(node, parentNodes) {
  const cpt = node.data.cpt
  if (!cpt) return 0.5

  // Marginalize over all possible parent state combinations
  let totalProb = 0
  const numParents = parentNodes.length
  const numCombinations = Math.pow(2, numParents)

  for (let i = 0; i < numCombinations; i++) {
    const states = []
    let jointProb = 1.0

    // Generate this combination of states and calculate joint probability
    for (let j = 0; j < numParents; j++) {
      const state = (i >> (numParents - 1 - j)) & 1
      states.push(state === 1)

      const parentProb = parentNodes[j].data?.probability ?? 0.5
      // P(parent = state)
      jointProb *= state === 1 ? parentProb : (1 - parentProb)
    }

    // Get CPT entry for this combination
    const key = states.join(',')
    const conditionalProb = cpt[key] ?? 0.5

    // Add weighted contribution
    totalProb += jointProb * conditionalProb
  }

  return totalProb
}

/**
 * Build a dependency graph to identify parent and child relationships
 *
 * @param {Array} nodes - Array of all nodes
 * @param {Array} edges - Array of all edges
 * @returns {Object} - Map of nodeId to {parents: [], children: []}
 */
export function buildDependencyGraph(nodes, edges) {
  const graph = {}

  // Initialize graph
  nodes.forEach(node => {
    graph[node.id] = {
      parents: [],
      children: []
    }
  })

  // Build relationships
  edges.forEach(edge => {
    if (graph[edge.target]) {
      graph[edge.target].parents.push(edge.source)
    }
    if (graph[edge.source]) {
      graph[edge.source].children.push(edge.target)
    }
  })

  return graph
}

/**
 * Get topological ordering of nodes (parents before children)
 * This is essential for proper Bayesian inference propagation
 *
 * @param {Array} nodes - Array of all nodes
 * @param {Object} graph - Dependency graph from buildDependencyGraph
 * @returns {Array} - Nodes in topological order
 */
export function getTopologicalOrder(nodes, graph) {
  const visited = new Set()
  const order = []

  function visit(nodeId) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const parents = graph[nodeId]?.parents || []
    parents.forEach(parentId => visit(parentId))

    order.push(nodeId)
  }

  nodes.forEach(node => visit(node.id))

  return order.map(id => nodes.find(n => n.id === id)).filter(Boolean)
}

/**
 * Propagate probability updates through the network
 * When a node's probability changes, update all descendants
 *
 * @param {Array} nodes - Array of all nodes
 * @param {Array} edges - Array of all edges
 * @param {string} changedNodeId - ID of the node that changed
 * @returns {Array} - Updated nodes array
 */
export function propagateProbabilities(nodes, edges, changedNodeId = null) {
  const graph = buildDependencyGraph(nodes, edges)
  const orderedNodes = getTopologicalOrder(nodes, graph)

  const updatedNodes = [...nodes]
  const nodeMap = new Map(updatedNodes.map(n => [n.id, n]))

  orderedNodes.forEach(node => {
    const parentIds = graph[node.id]?.parents || []

    // Skip if this node has no parents (use its prior probability)
    if (parentIds.length === 0) return

    const parentNodes = parentIds
      .map(id => nodeMap.get(id))
      .filter(Boolean)

    const currentNode = nodeMap.get(node.id)
    if (!currentNode) return

    // Calculate updated probability
    const newProbability = calculateNodeProbability(
      currentNode,
      parentNodes,
      edges
    )

    // Update the node in the map
    const updatedNode = {
      ...currentNode,
      data: {
        ...currentNode.data,
        probability: newProbability
      }
    }

    nodeMap.set(node.id, updatedNode)
  })

  return Array.from(nodeMap.values())
}

/**
 * Calculate the intervention effect (do-calculus)
 * Set a node to a specific value and propagate only to children
 * This implements Pearl's do-operator for causal inference
 *
 * @param {Array} nodes - Array of all nodes
 * @param {Array} edges - Array of all edges
 * @param {string} nodeId - ID of the node to intervene on
 * @param {number} interventionValue - The value to set (0-1)
 * @returns {Array} - Updated nodes array with intervention applied
 */
export function applyIntervention(nodes, edges, nodeId, interventionValue) {
  const graph = buildDependencyGraph(nodes, edges)
  const updatedNodes = [...nodes]
  const nodeMap = new Map(updatedNodes.map(n => [n.id, n]))

  // Set the intervention value
  const interventionNode = nodeMap.get(nodeId)
  if (interventionNode) {
    nodeMap.set(nodeId, {
      ...interventionNode,
      data: {
        ...interventionNode.data,
        probability: interventionValue
      }
    })
  }

  // Propagate to descendants only (not parents - that's the key difference)
  const toUpdate = new Set([nodeId])
  const processed = new Set()

  while (toUpdate.size > 0) {
    const currentId = Array.from(toUpdate)[0]
    toUpdate.delete(currentId)
    processed.add(currentId)

    const children = graph[currentId]?.children || []
    children.forEach(childId => {
      if (!processed.has(childId)) {
        toUpdate.add(childId)

        // Update child probability
        const childNode = nodeMap.get(childId)
        const parentIds = graph[childId]?.parents || []
        const parentNodes = parentIds.map(id => nodeMap.get(id)).filter(Boolean)

        const newProb = calculateNodeProbability(childNode, parentNodes, edges)
        nodeMap.set(childId, {
          ...childNode,
          data: {
            ...childNode.data,
            probability: newProb
          }
        })
      }
    })
  }

  return Array.from(nodeMap.values())
}

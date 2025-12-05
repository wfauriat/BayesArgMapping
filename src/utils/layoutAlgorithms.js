/**
 * Layout Algorithms for Graph Auto-Layout
 *
 * Modular architecture allowing easy addition of new layout algorithms.
 * Each algorithm is a function that takes (nodes, edges) and returns updated nodes with new positions.
 */

import { buildDependencyGraph } from './bayesianInference'

/**
 * Simple Layered Layout Algorithm
 *
 * Groups nodes into vertical layers based on their dependency level:
 * - Level 0: Nodes with no parents (root nodes) - positioned at top
 * - Level 1: Nodes whose parents are all in level 0 - positioned below
 * - Level N: Nodes whose parents are all in levels 0 to N-1
 *
 * Layout Direction: Top to Bottom (matches handle positions)
 * - Vertical spacing: 150px between layers (top to bottom)
 * - Horizontal spacing: Distributed evenly within each layer
 * - Starting position: (100, 100)
 *
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Array} - Nodes with updated positions
 */
export function simpleLayeredLayout(nodes, edges) {
  if (!nodes || nodes.length === 0) return nodes

  // Build dependency graph
  const graph = buildDependencyGraph(nodes, edges)

  // Assign levels to each node
  const levels = {}
  const visited = new Set()

  // Helper function to calculate node level
  function calculateLevel(nodeId) {
    if (visited.has(nodeId)) {
      return levels[nodeId]
    }

    visited.add(nodeId)
    const parents = graph[nodeId]?.parents || []

    if (parents.length === 0) {
      levels[nodeId] = 0
      return 0
    }

    // Level is max(parent levels) + 1
    const maxParentLevel = Math.max(...parents.map(pid => calculateLevel(pid)))
    levels[nodeId] = maxParentLevel + 1
    return levels[nodeId]
  }

  // Calculate levels for all nodes
  nodes.forEach(node => calculateLevel(node.id))

  // Group nodes by level
  const nodesByLevel = {}
  nodes.forEach(node => {
    const level = levels[node.id]
    if (!nodesByLevel[level]) {
      nodesByLevel[level] = []
    }
    nodesByLevel[level].push(node)
  })

  // Layout parameters
  const VERTICAL_SPACING = 150    // Distance between layers (top to bottom)
  const HORIZONTAL_SPACING = 200  // Distance between nodes in same layer
  const START_X = 100
  const START_Y = 100

  // Position nodes
  const updatedNodes = nodes.map(node => {
    const level = levels[node.id]
    const nodesInLevel = nodesByLevel[level]
    const indexInLevel = nodesInLevel.indexOf(node)

    // Calculate Y position based on level (top to bottom)
    const y = START_Y + level * VERTICAL_SPACING

    // Calculate X position - center the layer horizontally
    const totalWidth = (nodesInLevel.length - 1) * HORIZONTAL_SPACING
    const startX = START_X + (nodesInLevel.length > 1 ? 0 : totalWidth / 2)
    const x = startX + indexInLevel * HORIZONTAL_SPACING

    return {
      ...node,
      position: { x, y }
    }
  })

  return updatedNodes
}

/**
 * Available Layout Algorithms
 *
 * This object serves as a registry for all available layout algorithms.
 * To add a new algorithm:
 * 1. Import the algorithm function (or define it in this file)
 * 2. Add it to this object with a descriptive key
 * 3. The algorithm should accept (nodes, edges) and return updated nodes
 *
 * Future algorithms to add:
 * - hierarchical: Uses dagre library for hierarchical DAG layout
 * - force: Uses D3-force for physics-based layout
 * - elk: Uses Eclipse Layout Kernel for advanced layouts
 */
export const layoutAlgorithms = {
  simple: {
    name: 'Simple Layered',
    description: 'Top-to-bottom layer-based layout for DAGs',
    algorithm: simpleLayeredLayout
  }
  // Future additions:
  // hierarchical: {
  //   name: 'Hierarchical (Dagre)',
  //   description: 'Advanced DAG layout using Dagre',
  //   algorithm: dagreLayout
  // },
  // force: {
  //   name: 'Force-Directed',
  //   description: 'Physics-based organic layout',
  //   algorithm: forceLayout
  // }
}

/**
 * Apply a layout algorithm to nodes
 *
 * @param {string} algorithmKey - Key from layoutAlgorithms object
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Array} - Nodes with updated positions
 */
export function applyLayout(algorithmKey, nodes, edges) {
  const layout = layoutAlgorithms[algorithmKey]

  if (!layout) {
    console.warn(`Layout algorithm '${algorithmKey}' not found. Using 'simple' instead.`)
    return layoutAlgorithms.simple.algorithm(nodes, edges)
  }

  return layout.algorithm(nodes, edges)
}

/**
 * Get list of available layout algorithms
 *
 * @returns {Array} - Array of {key, name, description} objects
 */
export function getAvailableLayouts() {
  return Object.entries(layoutAlgorithms).map(([key, layout]) => ({
    key,
    name: layout.name,
    description: layout.description
  }))
}

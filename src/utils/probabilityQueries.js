/**
 * Probability Query Engine
 * Implements conditional probability queries using enumeration inference
 */

import { buildDependencyGraph } from './bayesianInference';

/**
 * Calculate conditional probability: P(query | evidence)
 * Uses enumeration to compute exact probabilities
 */
export function calculateConditionalProbability(nodes, edges, queryNode, evidence) {
  const reasoning = [];

  // Log evidence
  const evidenceNodes = [];
  Object.entries(evidence).forEach(([nodeId, value]) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      evidenceNodes.push({ id: nodeId, label: node.data.label, value });
      reasoning.push({
        type: 'evidence',
        message: `Set evidence: ${node.data.label} = ${value > 0.5 ? 'True' : 'False'} (${(value * 100).toFixed(0)}%)`
      });
    }
  });

  reasoning.push({
    type: 'info',
    message: `Calculating P(${queryNode.data.label} | evidence) using enumeration...`
  });

  // Calculate P(query=true, evidence) and P(query=false, evidence)
  const probQueryTrueGivenEvidence = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.99 });
  const probQueryFalseGivenEvidence = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.01 });

  console.log('\n=== PROBABILITY QUERY ===');
  console.log('Query:', queryNode.data.label);
  console.log('Evidence:', Object.entries(evidence).map(([id, v]) => {
    const n = nodes.find(n => n.id === id);
    return `${n?.data.label}=${v > 0.5 ? 'T' : 'F'}`;
  }).join(', '));
  console.log('P(query=T, evidence):', probQueryTrueGivenEvidence.toExponential(4));
  console.log('P(query=F, evidence):', probQueryFalseGivenEvidence.toExponential(4));

  // Normalize
  const normalizer = probQueryTrueGivenEvidence + probQueryFalseGivenEvidence;
  const posteriorProbability = normalizer > 0 ? probQueryTrueGivenEvidence / normalizer : queryNode.data.probability;

  console.log('Normalizer:', normalizer.toExponential(4));
  console.log('Posterior P(query=T | evidence):', (posteriorProbability * 100).toFixed(2) + '%');
  console.log('========================\n');

  reasoning.push({
    type: 'calculation',
    message: `P(${queryNode.data.label}=True, evidence) = ${probQueryTrueGivenEvidence.toExponential(2)}`
  });
  reasoning.push({
    type: 'calculation',
    message: `P(${queryNode.data.label}=False, evidence) = ${probQueryFalseGivenEvidence.toExponential(2)}`
  });
  reasoning.push({
    type: 'method',
    message: `Normalizing: ${probQueryTrueGivenEvidence.toExponential(2)} / (${probQueryTrueGivenEvidence.toExponential(2)} + ${probQueryFalseGivenEvidence.toExponential(2)})`
  });
  reasoning.push({
    type: 'result',
    message: `Result: P(${queryNode.data.label} | evidence) = ${(posteriorProbability * 100).toFixed(1)}%`
  });

  return {
    probability: posteriorProbability,
    reasoning,
    evidenceApplied: evidenceNodes,
    queryNode: {
      id: queryNode.id,
      label: queryNode.data.label,
      probability: posteriorProbability
    }
  };
}

/**
 * Enumerate all possible states and sum probabilities
 * This implements exact inference via enumeration
 */
function enumerateAll(nodes, edges, evidence) {
  const graph = buildDependencyGraph(nodes, edges);

  // Get all nodes not in evidence
  const hiddenVars = nodes.filter(n => !(n.id in evidence));

  if (hiddenVars.length === 0) {
    // All variables assigned - compute probability
    return computeJointProbability(nodes, edges, evidence, graph);
  }

  // Enumerate over hidden variable
  const variable = hiddenVars[0];

  // Sum over both values of this variable
  const probTrue = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.99 });
  const probFalse = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.01 });

  return probTrue + probFalse;
}

/**
 * Compute joint probability of a complete assignment
 * P(X1, X2, ..., Xn) = ∏ P(Xi | Parents(Xi))
 */
function computeJointProbability(nodes, edges, assignment, graph) {
  let jointProb = 1.0;

  for (const node of nodes) {
    const value = assignment[node.id];
    const parents = graph[node.id]?.parents || [];

    if (parents.length === 0) {
      // P(node) - root node uses prior
      const prior = node.data.probability;
      jointProb *= (value > 0.5) ? prior : (1 - prior);
    } else {
      // P(node | parents)
      const conditionalProb = computeConditionalProbability(node, parents, assignment, nodes, edges);
      jointProb *= (value > 0.5) ? conditionalProb : (1 - conditionalProb);
    }
  }

  return jointProb;
}

/**
 * Compute P(node | parents) given parent values
 */
function computeConditionalProbability(node, parentIds, assignment, nodes, edges) {
  const parentNodes = parentIds.map(pid => nodes.find(n => n.id === pid)).filter(Boolean);
  const parentEdges = edges.filter(e => e.target === node.id && parentIds.includes(e.source));

  // Use CPT if available
  if (node.data.useCPT && node.data.cpt) {
    return computeFromCPT(node, parentNodes, assignment);
  }

  // Use Noisy-OR model
  return computeNoisyOR(parentNodes, parentEdges, assignment);
}

/**
 * Compute probability using Noisy-OR
 * P(child=true | parents) = 1 - (1-leak) × ∏(1 - strength_i) for all true parents
 * The leak probability allows the child to be true even when all parents are false
 */
function computeNoisyOR(parentNodes, parentEdges, assignment) {
  if (parentNodes.length === 0) return 0.5;

  const LEAK_PROBABILITY = 0.0001; // Small probability child is true even if all parents false

  // Start with probability that no cause activates the child
  // This is (1 - leak) for the leak cause
  let probAllInhibited = 1.0 - LEAK_PROBABILITY;

  for (const parent of parentNodes) {
    const parentValue = assignment[parent.id];
    const edge = parentEdges.find(e => e.source === parent.id);

    if (edge && parentValue > 0.5) {
      // Parent is true - multiply by probability this cause is inhibited
      const strength = edge.data.probability;
      probAllInhibited *= (1 - strength);
    }
    // If parent is false, it doesn't contribute to activating the child
  }

  // P(child=true) = 1 - P(all causes inhibited)
  return 1 - probAllInhibited;
}

/**
 * Compute probability from CPT
 */
function computeFromCPT(node, parentNodes, assignment) {
  const cpt = node.data.cpt;

  // Build parent state key
  const parentStates = {};
  parentNodes.forEach(parent => {
    parentStates[parent.id] = assignment[parent.id] > 0.5;
  });

  // Find matching CPT entry
  const entry = Object.values(cpt || {}).find(e => {
    if (typeof e === 'object' && e.parents) {
      return Object.entries(e.parents).every(([pid, state]) =>
        parentStates[pid] === state
      );
    }
    return false;
  });

  return entry ? entry.probability : 0.5;
}

/**
 * Find Most Probable Explanation (MPE)
 */
export function findMostProbableExplanation(nodes, edges, evidence) {
  const reasoning = [];

  const evidenceIds = Object.keys(evidence);
  const unobservedNodes = nodes.filter(n => !evidenceIds.includes(n.id));

  reasoning.push({
    type: 'info',
    message: `Finding MPE for ${unobservedNodes.length} unobserved node(s) given ${evidenceIds.length} evidence node(s)`
  });

  if (unobservedNodes.length === 0) {
    return {
      assignment: {},
      probability: 1.0,
      reasoning: [{ type: 'info', message: 'All nodes are observed' }]
    };
  }

  // For small networks, do exact enumeration
  if (unobservedNodes.length <= 8) {
    reasoning.push({
      type: 'method',
      message: `Using exact enumeration over ${Math.pow(2, unobservedNodes.length)} possible assignments`
    });

    return exactMPE(nodes, edges, evidence, unobservedNodes, reasoning);
  }

  // For larger networks, use greedy approximation
  reasoning.push({
    type: 'method',
    message: `Using greedy approximation (network too large for exact enumeration)`
  });

  return greedyMPE(nodes, edges, evidence, unobservedNodes, reasoning);
}

/**
 * Exact MPE using enumeration
 */
function exactMPE(nodes, edges, evidence, unobservedNodes, reasoning) {
  const graph = buildDependencyGraph(nodes, edges);
  const numVars = unobservedNodes.length;
  const numCombinations = Math.pow(2, numVars);

  let bestAssignment = {};
  let bestProb = -1;

  // Try all possible assignments
  for (let i = 0; i < numCombinations; i++) {
    const assignment = { ...evidence };

    // Generate assignment for unobserved variables
    unobservedNodes.forEach((node, idx) => {
      const value = (i & (1 << idx)) ? 0.99 : 0.01;
      assignment[node.id] = value;
    });

    // Calculate joint probability
    const prob = computeJointProbability(nodes, edges, assignment, graph);

    if (prob > bestProb) {
      bestProb = prob;
      bestAssignment = { ...assignment };
    }
  }

  // Extract unobserved assignments
  const result = {};
  unobservedNodes.forEach(node => {
    result[node.id] = bestAssignment[node.id];
    reasoning.push({
      type: 'assignment',
      message: `${node.data.label} = ${bestAssignment[node.id] > 0.5 ? 'True' : 'False'} (${(bestAssignment[node.id] * 100).toFixed(0)}%)`
    });
  });

  reasoning.push({
    type: 'result',
    message: `Joint probability of MPE: ${bestProb.toExponential(3)}`
  });

  return { assignment: result, probability: bestProb, reasoning };
}

/**
 * Greedy MPE approximation
 */
function greedyMPE(nodes, edges, evidence, unobservedNodes, reasoning) {
  const assignment = {};
  const graph = buildDependencyGraph(nodes, edges);

  // Process nodes in topological order
  const sorted = topologicalSort(nodes, graph);
  const currentAssignment = { ...evidence };

  sorted.forEach(nodeId => {
    if (nodeId in evidence) return; // Skip evidence

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Calculate probability with node=true
    const probTrue = computeConditionalProbability(node, graph[nodeId]?.parents || [], currentAssignment, nodes, edges);

    // Assign most likely value
    const value = probTrue > 0.5 ? 0.99 : 0.01;
    currentAssignment[nodeId] = value;
    assignment[nodeId] = value;

    reasoning.push({
      type: 'assignment',
      message: `${node.data.label} = ${value > 0.5 ? 'True' : 'False'} (P=${(probTrue * 100).toFixed(0)}%)`
    });
  });

  return { assignment, probability: 0, reasoning };
}

/**
 * Topological sort
 */
function topologicalSort(nodes, graph) {
  const visited = new Set();
  const sorted = [];

  function visit(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const parents = graph[nodeId]?.parents || [];
    parents.forEach(visit);

    sorted.push(nodeId);
  }

  nodes.forEach(node => visit(node.id));
  return sorted;
}

/**
 * Get queryable nodes (exclude intervention nodes)
 */
export function getQueryableNodes(nodes) {
  return nodes.filter(n => !n.data.intervention?.active);
}

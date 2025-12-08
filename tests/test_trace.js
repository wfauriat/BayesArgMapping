/**
 * Detailed trace of enumeration for one specific case
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const burglarNetwork = JSON.parse(readFileSync(join(__dirname, 'test_cases', 'burglary_alarm_network.json'), 'utf8'));

// Inference functions with DEBUG LOGGING

function buildDependencyGraph(nodes, edges) {
  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = { parents: [], children: [] };
  });
  edges.forEach(edge => {
    if (graph[edge.target]) graph[edge.target].parents.push(edge.source);
    if (graph[edge.source]) graph[edge.source].children.push(edge.target);
  });
  return graph;
}

function computeNoisyOR(parentNodes, parentEdges, assignment) {
  if (parentNodes.length === 0) return 0.5;

  const LEAK_PROBABILITY = 0.0001;
  let probAllInhibited = 1.0 - LEAK_PROBABILITY;

  for (const parent of parentNodes) {
    const parentValue = assignment[parent.id];
    const edge = parentEdges.find(e => e.source === parent.id);

    if (edge && parentValue > 0.5) {
      const strength = edge.data.probability;
      probAllInhibited *= (1 - strength);
    }
  }

  return 1 - probAllInhibited;
}

function computeConditionalProbability(node, parentIds, assignment, nodes, edges) {
  const parentNodes = parentIds.map(pid => nodes.find(n => n.id === pid)).filter(Boolean);
  const parentEdges = edges.filter(e => e.target === node.id && parentIds.includes(e.source));
  return computeNoisyOR(parentNodes, parentEdges, assignment);
}

function computeJointProbability(nodes, edges, assignment, graph, debug = false) {
  let jointProb = 1.0;

  if (debug) console.log('\n  --- Computing Joint Probability ---');

  for (const node of nodes) {
    const value = assignment[node.id];
    const parents = graph[node.id]?.parents || [];

    if (parents.length === 0) {
      const prior = node.data.probability;
      const contribution = (value > 0.5) ? prior : (1 - prior);
      jointProb *= contribution;
      if (debug) console.log(`  ${node.data.label}: P=${prior}, value=${value > 0.5 ? 'T' : 'F'}, contrib=${contribution.toExponential(4)}`);
    } else {
      const conditionalProb = computeConditionalProbability(node, parents, assignment, nodes, edges);
      const contribution = (value > 0.5) ? conditionalProb : (1 - conditionalProb);
      jointProb *= contribution;
      if (debug) {
        const parentStr = parents.map(pid => {
          const p = nodes.find(n => n.id === pid);
          return `${p.data.label}=${assignment[pid] > 0.5 ? 'T' : 'F'}`;
        }).join(', ');
        console.log(`  ${node.data.label}: P(·|${parentStr})=${conditionalProb.toFixed(4)}, value=${value > 0.5 ? 'T' : 'F'}, contrib=${contribution.toExponential(4)}`);
      }
    }
  }

  if (debug) console.log(`  Joint: ${jointProb.toExponential(4)}`);
  return jointProb;
}

let callCount = 0;

function enumerateAll(nodes, edges, evidence, depth = 0) {
  const graph = buildDependencyGraph(nodes, edges);
  const hiddenVars = nodes.filter(n => !(n.id in evidence));

  if (hiddenVars.length === 0) {
    const debug = callCount < 2; // Only debug first 2 complete assignments
    callCount++;
    if (debug) {
      console.log(`\n[Call ${callCount}] Complete assignment:`);
      nodes.forEach(n => {
        console.log(`  ${n.data.label} = ${evidence[n.id] > 0.5 ? 'T' : 'F'}`);
      });
    }
    return computeJointProbability(nodes, edges, evidence, graph, debug);
  }

  const variable = hiddenVars[0];
  const probTrue = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.99 }, depth + 1);
  const probFalse = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.01 }, depth + 1);

  return probTrue + probFalse;
}

// Test: P(Burglary | John=T)
const { nodes, edges } = burglarNetwork;
const queryNode = nodes.find(n => n.data.label === 'Burglary');
const johnNode = nodes.find(n => n.data.label === 'John Calls');

const evidence = { [johnNode.id]: 0.99 };

console.log('=== TRACE: P(Burglary=T | John=T) ===');
console.log('\nCalculating P(Burglary=T, John=T)...');
const probBT_JT = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.99 });

console.log('\n\nCalculating P(Burglary=F, John=T)...');
callCount = 0; // Reset to show B=F cases
const probBF_JT = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.01 });

const normalizer = probBT_JT + probBF_JT;
const posterior = probBT_JT / normalizer;

console.log('\n=== RESULT ===');
console.log(`P(B=T, J=T) = ${probBT_JT.toExponential(6)}`);
console.log(`P(B=F, J=T) = ${probBF_JT.toExponential(6)}`);
console.log(`Normalizer = ${normalizer.toExponential(6)}`);
console.log(`P(Burglary | John=T) = ${(posterior * 100).toFixed(2)}%`);
console.log(`\nExpected: ~82%`);

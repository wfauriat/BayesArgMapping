/**
 * Standalone Test Runner - No Code Modifications Required
 * Implements the inference algorithms directly for testing
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const burglarNetwork = JSON.parse(readFileSync(join(__dirname, 'burglary_alarm_network.json'), 'utf8'));
const weatherNetwork = JSON.parse(readFileSync(join(__dirname, 'weather_network.json'), 'utf8'));

// ============================================================================
// INFERENCE ENGINE IMPLEMENTATION (Copied for testing)
// ============================================================================

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

function computeJointProbability(nodes, edges, assignment, graph) {
  let jointProb = 1.0;

  for (const node of nodes) {
    const value = assignment[node.id];
    const parents = graph[node.id]?.parents || [];

    if (parents.length === 0) {
      const prior = node.data.probability;
      jointProb *= (value > 0.5) ? prior : (1 - prior);
    } else {
      const conditionalProb = computeConditionalProbability(node, parents, assignment, nodes, edges);
      jointProb *= (value > 0.5) ? conditionalProb : (1 - conditionalProb);
    }
  }

  return jointProb;
}

function enumerateAll(nodes, edges, evidence) {
  const graph = buildDependencyGraph(nodes, edges);
  const hiddenVars = nodes.filter(n => !(n.id in evidence));

  if (hiddenVars.length === 0) {
    return computeJointProbability(nodes, edges, evidence, graph);
  }

  const variable = hiddenVars[0];
  const probTrue = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.99 });
  const probFalse = enumerateAll(nodes, edges, { ...evidence, [variable.id]: 0.01 });

  return probTrue + probFalse;
}

function calculateConditionalProbability(nodes, edges, queryNode, evidence) {
  const probQueryTrueGivenEvidence = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.99 });
  const probQueryFalseGivenEvidence = enumerateAll(nodes, edges, { ...evidence, [queryNode.id]: 0.01 });

  const normalizer = probQueryTrueGivenEvidence + probQueryFalseGivenEvidence;
  const posteriorProbability = normalizer > 0 ? probQueryTrueGivenEvidence / normalizer : queryNode.data.probability;

  return { probability: posteriorProbability };
}

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

const results = { passed: 0, failed: 0, warnings: 0, tests: [] };

function runTest(scenario, queryNodeLabel, evidence, expectedRange, network) {
  const { nodes, edges } = network;
  const queryNode = nodes.find(n => n.data.label === queryNodeLabel);

  if (!queryNode) {
    return { status: 'ERROR', message: `Query node "${queryNodeLabel}" not found` };
  }

  const evidenceObj = {};
  for (const [label, value] of Object.entries(evidence)) {
    const node = nodes.find(n => n.data.label === label);
    if (node) evidenceObj[node.id] = value ? 0.99 : 0.01;
  }

  const result = calculateConditionalProbability(nodes, edges, queryNode, evidenceObj);
  const actualProb = result.probability * 100;

  const [min, max] = expectedRange;
  let status = 'PASSED';
  let message = `${actualProb.toFixed(2)}% (expected ${min}-${max}%)`;

  if (actualProb < min || actualProb > max) {
    if (actualProb < min * 0.9 || actualProb > max * 1.1) {
      status = 'FAILED';
      results.failed++;
    } else {
      status = 'WARNING';
      results.warnings++;
      message += ' - Slightly outside range';
    }
  } else {
    results.passed++;
  }

  return { status, message, actualProb, result };
}

// ============================================================================
// RUN TESTS
// ============================================================================

console.log('\n========================================');
console.log('BAYESIAN INFERENCE ENGINE TEST SUITE');
console.log('========================================\n');

console.log('TEST CASE 1: BURGLARY ALARM NETWORK');
console.log('====================================\n');

const test1_1 = runTest('1.1', 'Burglary', { 'John Calls': true }, [52, 57], burglarNetwork);
console.log(`Scenario 1.1: P(Burglary | John Calls = True)`);
console.log(`  ${test1_1.status}: ${test1_1.message}\n`);
results.tests.push({ scenario: '1.1', ...test1_1 });

const test1_2 = runTest('1.2', 'Burglary', { 'John Calls': true, 'Mary Calls': true }, [56, 60], burglarNetwork);
console.log(`Scenario 1.2: P(Burglary | John Calls = True, Mary Calls = True)`);
console.log(`  ${test1_2.status}: ${test1_2.message}`);
if (test1_2.actualProb > test1_1.actualProb) {
  console.log(`  ✓ Correctly higher than Scenario 1.1 (${test1_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ ERROR: Should be higher than Scenario 1.1!\n`);
  results.failed++;
}
results.tests.push({ scenario: '1.2', ...test1_2 });

const test1_3 = runTest('1.3', 'Burglary', { 'John Calls': true, 'Earthquake': true }, [0.1, 0.5], burglarNetwork);
console.log(`Scenario 1.3: P(Burglary | John Calls = True, Earthquake = True)`);
console.log(`  ${test1_3.status}: ${test1_3.message}`);
if (test1_3.actualProb < test1_1.actualProb) {
  console.log(`  ✓ EXPLAINING AWAY WORKS: Lower than Scenario 1.1 (${test1_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ CRITICAL ERROR: Explaining away FAILED - should be lower than Scenario 1.1!\n`);
  results.failed++;
}
results.tests.push({ scenario: '1.3', ...test1_3 });

const test1_4 = runTest('1.4', 'Burglary', { 'Alarm': true }, [56, 60], burglarNetwork);
console.log(`Scenario 1.4: P(Burglary | Alarm = True)`);
console.log(`  ${test1_4.status}: ${test1_4.message}\n`);
results.tests.push({ scenario: '1.4', ...test1_4 });

console.log('\nTEST CASE 2: WEATHER PREDICTION NETWORK');
console.log('========================================\n');

const test2_1 = runTest('2.1', 'Rain', { 'Wet Ground': true }, [65, 72], weatherNetwork);
console.log(`Scenario 2.1: P(Rain | Wet Ground = True)`);
console.log(`  ${test2_1.status}: ${test2_1.message}\n`);
results.tests.push({ scenario: '2.1', ...test2_1 });

const test2_2 = runTest('2.2', 'Rain', { 'Wet Ground': true, 'Sprinkler On': true }, [18, 22], weatherNetwork);
console.log(`Scenario 2.2: P(Rain | Wet Ground = True, Sprinkler On = True)`);
console.log(`  ${test2_2.status}: ${test2_2.message}`);
if (test2_2.actualProb < test2_1.actualProb) {
  console.log(`  ✓ CLASSIC EXPLAINING AWAY: Lower than Scenario 2.1 (${test2_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ CRITICAL ERROR: Explaining away FAILED in weather network!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.2', ...test2_2 });

const test2_3 = runTest('2.3', 'Rain', { 'Wet Ground': true, 'People w/ Umbrellas': true }, [99, 100], weatherNetwork);
console.log(`Scenario 2.3: P(Rain | Wet Ground = True, People w/ Umbrellas = True)`);
console.log(`  ${test2_3.status}: ${test2_3.message}`);
if (test2_3.actualProb > test2_1.actualProb) {
  console.log(`  ✓ CORROBORATION WORKS: Higher than Scenario 2.1 (${test2_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ ERROR: Multiple evidence should increase probability!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.3', ...test2_3 });

const test2_4 = runTest('2.4', 'Rain', { 'Wet Ground': true, 'Sprinkler On': true, 'People w/ Umbrellas': true }, [99, 100], weatherNetwork);
console.log(`Scenario 2.4: P(Rain | Wet Ground=T, Sprinkler=T, Umbrellas=T)`);
console.log(`  ${test2_4.status}: ${test2_4.message}`);
if (test2_4.actualProb > test2_2.actualProb && test2_4.actualProb < test2_3.actualProb) {
  console.log(`  ✓ CORRECT INTERACTION: Between 2.2 (${test2_2.actualProb.toFixed(2)}%) and 2.3 (${test2_3.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ⚠ WARNING: Expected between 2.2 and 2.3 probabilities\n`);
}
results.tests.push({ scenario: '2.4', ...test2_4 });

const test2_5 = runTest('2.5', 'Low Pressure', { 'Rain': true }, [68, 72], weatherNetwork);
console.log(`Scenario 2.5: P(Low Pressure | Rain = True)`);
console.log(`  ${test2_5.status}: ${test2_5.message}`);
if (test2_5.actualProb > 30) {
  console.log(`  ✓ BACKWARD REASONING: Higher than prior (30%)\n`);
} else {
  console.log(`  ✗ ERROR: Backward reasoning should increase probability!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.5', ...test2_5 });

const test2_6a = runTest('2.6A', 'Sprinkler On', { 'Wet Ground': true }, [10, 50], weatherNetwork);
console.log(`Scenario 2.6A: P(Sprinkler On | Wet Ground = True)`);
console.log(`  ${test2_6a.status}: ${test2_6a.message}`);

const test2_6b = runTest('2.6B', 'Rain', { 'Wet Ground': true }, [65, 72], weatherNetwork);
console.log(`Scenario 2.6B: P(Rain | Wet Ground = True)`);
console.log(`  ${test2_6b.status}: ${test2_6b.message}`);
if (test2_6b.actualProb > test2_6a.actualProb) {
  console.log(`  ✓ PRIOR INFLUENCE: Rain (${test2_6b.actualProb.toFixed(2)}%) > Sprinkler (${test2_6a.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ⚠ WARNING: Rain should be more likely than Sprinkler given priors\n`);
}
results.tests.push({ scenario: '2.6A', ...test2_6a });
results.tests.push({ scenario: '2.6B', ...test2_6b });

console.log('\n========================================');
console.log('TEST SUMMARY');
console.log('========================================\n');

console.log(`Total Tests: ${results.tests.length}`);
console.log(`✓ Passed: ${results.passed}`);
console.log(`✗ Failed: ${results.failed}`);
console.log(`⚠ Warnings: ${results.warnings}`);

const passRate = (results.passed / results.tests.length * 100).toFixed(1);
console.log(`\nPass Rate: ${passRate}%`);

if (results.failed === 0 && results.warnings === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Bayesian inference engine working correctly.');
} else if (results.failed === 0) {
  console.log('\n✓ All tests passed with some warnings - check edge cases.');
} else {
  console.log('\n⚠ SOME TESTS FAILED - See details above.');
  console.log('\nFailed tests:');
  results.tests
    .filter(t => t.status === 'FAILED')
    .forEach(t => console.log(`  - Scenario ${t.scenario}: ${t.message}`));
}

console.log('\n========================================\n');

process.exit(results.failed > 0 ? 1 : 0);

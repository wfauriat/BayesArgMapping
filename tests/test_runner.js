/**
 * Automated Test Runner for Bayesian Inference Engine
 * Tests all scenarios from PROBABILITY_QUERY_TEST_SCENARIOS.md
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import test networks
const burglarNetwork = JSON.parse(readFileSync(join(__dirname, 'test_cases', 'burglary_alarm_network.json'), 'utf8'));
const weatherNetwork = JSON.parse(readFileSync(join(__dirname, 'test_cases', 'weather_network.json'), 'utf8'));

// Import inference functions
import {
  calculateConditionalProbability,
  findMostProbableExplanation
} from './src/utils/probabilityQueries.js';

// Test result tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

/**
 * Test helper function
 */
function runTest(scenario, queryNodeLabel, evidence, expectedRange, network) {
  const { nodes, edges } = network;

  // Find query node
  const queryNode = nodes.find(n => n.data.label === queryNodeLabel);
  if (!queryNode) {
    return {
      status: 'ERROR',
      message: `Query node "${queryNodeLabel}" not found`
    };
  }

  // Build evidence object
  const evidenceObj = {};
  for (const [label, value] of Object.entries(evidence)) {
    const node = nodes.find(n => n.data.label === label);
    if (node) {
      evidenceObj[node.id] = value ? 0.99 : 0.01;
    }
  }

  // Calculate probability
  const result = calculateConditionalProbability(nodes, edges, queryNode, evidenceObj);
  const actualProb = result.probability * 100; // Convert to percentage

  // Check against expected range
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

/**
 * MPE test helper
 */
function runMPETest(scenario, evidence, expectedAssignments, network) {
  const { nodes, edges } = network;

  // Build evidence object
  const evidenceObj = {};
  for (const [label, value] of Object.entries(evidence)) {
    const node = nodes.find(n => n.data.label === label);
    if (node) {
      evidenceObj[node.id] = value ? 0.99 : 0.01;
    }
  }

  // Find MPE
  const result = findMostProbableExplanation(nodes, edges, evidenceObj);

  // Check expected assignments
  const matches = [];
  const mismatches = [];

  for (const [label, expectedValue] of Object.entries(expectedAssignments)) {
    const node = nodes.find(n => n.data.label === label);
    if (node) {
      const actualValue = result.assignment[node.id] > 0.5;
      if (actualValue === expectedValue) {
        matches.push(`${label}=${expectedValue ? 'T' : 'F'} ✓`);
      } else {
        mismatches.push(`${label}: expected ${expectedValue ? 'T' : 'F'}, got ${actualValue ? 'T' : 'F'}`);
      }
    }
  }

  let status = mismatches.length === 0 ? 'PASSED' : 'FAILED';
  if (status === 'PASSED') {
    results.passed++;
  } else {
    results.failed++;
  }

  return {
    status,
    message: mismatches.length > 0 ? mismatches.join(', ') : matches.join(', '),
    result
  };
}

console.log('\n========================================');
console.log('BAYESIAN INFERENCE ENGINE TEST SUITE');
console.log('========================================\n');

// ============================================================================
// TEST CASE 1: BURGLARY ALARM NETWORK
// ============================================================================

console.log('TEST CASE 1: BURGLARY ALARM NETWORK');
console.log('====================================\n');

// Scenario 1.1: Single Evidence - John Calls
console.log('Scenario 1.1: P(Burglary | John Calls = True)');
const test1_1 = runTest(
  'Scenario 1.1',
  'Burglary',
  { 'John Calls': true },
  [0.5, 1.5],
  burglarNetwork
);
console.log(`  ${test1_1.status}: ${test1_1.message}\n`);
results.tests.push({ scenario: '1.1', ...test1_1 });

// Scenario 1.2: Multiple Evidence - Both Neighbors Call
console.log('Scenario 1.2: P(Burglary | John Calls = True, Mary Calls = True)');
const test1_2 = runTest(
  'Scenario 1.2',
  'Burglary',
  { 'John Calls': true, 'Mary Calls': true },
  [1, 3],
  burglarNetwork
);
console.log(`  ${test1_2.status}: ${test1_2.message}`);
// Check it's higher than 1.1
if (test1_2.actualProb > test1_1.actualProb) {
  console.log(`  ✓ Correctly higher than Scenario 1.1 (${test1_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ ERROR: Should be higher than Scenario 1.1!\n`);
  results.failed++;
}
results.tests.push({ scenario: '1.2', ...test1_2 });

// Scenario 1.3: Explaining Away
console.log('Scenario 1.3: P(Burglary | John Calls = True, Earthquake = True)');
const test1_3 = runTest(
  'Scenario 1.3',
  'Burglary',
  { 'John Calls': true, 'Earthquake': true },
  [0.1, 0.5],
  burglarNetwork
);
console.log(`  ${test1_3.status}: ${test1_3.message}`);
// Check explaining away works
if (test1_3.actualProb < test1_1.actualProb) {
  console.log(`  ✓ EXPLAINING AWAY WORKS: Lower than Scenario 1.1 (${test1_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ CRITICAL ERROR: Explaining away FAILED - should be lower than Scenario 1.1!\n`);
  results.failed++;
}
results.tests.push({ scenario: '1.3', ...test1_3 });

// Scenario 1.4: Direct Evidence
console.log('Scenario 1.4: P(Burglary | Alarm = True)');
const test1_4 = runTest(
  'Scenario 1.4',
  'Burglary',
  { 'Alarm': true },
  [3, 5],
  burglarNetwork
);
console.log(`  ${test1_4.status}: ${test1_4.message}\n`);
results.tests.push({ scenario: '1.4', ...test1_4 });

// Scenario 1.5: Most Probable Explanation
console.log('Scenario 1.5: MPE with John Calls = True, Mary Calls = True');
const test1_5 = runMPETest(
  'Scenario 1.5',
  { 'John Calls': true, 'Mary Calls': true },
  { 'Alarm': true, 'Burglary': false, 'Earthquake': false },
  burglarNetwork
);
console.log(`  ${test1_5.status}: ${test1_5.message}\n`);
results.tests.push({ scenario: '1.5', ...test1_5 });

// ============================================================================
// TEST CASE 2: WEATHER PREDICTION NETWORK
// ============================================================================

console.log('\nTEST CASE 2: WEATHER PREDICTION NETWORK');
console.log('========================================\n');

// Scenario 2.1: Basic Evidence Propagation
console.log('Scenario 2.1: P(Rain | Wet Ground = True)');
const test2_1 = runTest(
  'Scenario 2.1',
  'Rain',
  { 'Wet Ground': true },
  [50, 70],
  weatherNetwork
);
console.log(`  ${test2_1.status}: ${test2_1.message}\n`);
results.tests.push({ scenario: '2.1', ...test2_1 });

// Scenario 2.2: Explaining Away (Classic)
console.log('Scenario 2.2: P(Rain | Wet Ground = True, Sprinkler On = True)');
const test2_2 = runTest(
  'Scenario 2.2',
  'Rain',
  { 'Wet Ground': true, 'Sprinkler On': true },
  [20, 40],
  weatherNetwork
);
console.log(`  ${test2_2.status}: ${test2_2.message}`);
// Check explaining away
if (test2_2.actualProb < test2_1.actualProb) {
  console.log(`  ✓ CLASSIC EXPLAINING AWAY: Lower than Scenario 2.1 (${test2_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ CRITICAL ERROR: Explaining away FAILED in weather network!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.2', ...test2_2 });

// Scenario 2.3: Multiple Corroborating Evidence
console.log('Scenario 2.3: P(Rain | Wet Ground = True, People w/ Umbrellas = True)');
const test2_3 = runTest(
  'Scenario 2.3',
  'Rain',
  { 'Wet Ground': true, 'People w/ Umbrellas': true },
  [80, 95],
  weatherNetwork
);
console.log(`  ${test2_3.status}: ${test2_3.message}`);
// Check corroboration
if (test2_3.actualProb > test2_1.actualProb) {
  console.log(`  ✓ CORROBORATION WORKS: Higher than Scenario 2.1 (${test2_1.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ✗ ERROR: Multiple evidence should increase probability!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.3', ...test2_3 });

// Scenario 2.4: Explaining Away with Corroboration
console.log('Scenario 2.4: P(Rain | Wet Ground=T, Sprinkler=T, Umbrellas=T)');
const test2_4 = runTest(
  'Scenario 2.4',
  'Rain',
  { 'Wet Ground': true, 'Sprinkler On': true, 'People w/ Umbrellas': true },
  [60, 80],
  weatherNetwork
);
console.log(`  ${test2_4.status}: ${test2_4.message}`);
// Check it's between 2.2 and 2.3
if (test2_4.actualProb > test2_2.actualProb && test2_4.actualProb < test2_3.actualProb) {
  console.log(`  ✓ CORRECT INTERACTION: Between 2.2 (${test2_2.actualProb.toFixed(2)}%) and 2.3 (${test2_3.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ⚠ WARNING: Expected between 2.2 and 2.3 probabilities\n`);
}
results.tests.push({ scenario: '2.4', ...test2_4 });

// Scenario 2.5: Backward Reasoning to Root Causes
console.log('Scenario 2.5: P(Low Pressure | Rain = True)');
const test2_5 = runTest(
  'Scenario 2.5',
  'Low Pressure',
  { 'Rain': true },
  [35, 45],
  weatherNetwork
);
console.log(`  ${test2_5.status}: ${test2_5.message}`);
// Check it's higher than prior (30%)
if (test2_5.actualProb > 30) {
  console.log(`  ✓ BACKWARD REASONING: Higher than prior (30%)\n`);
} else {
  console.log(`  ✗ ERROR: Backward reasoning should increase probability!\n`);
  results.failed++;
}
results.tests.push({ scenario: '2.5', ...test2_5 });

// Scenario 2.6: Symmetric Explaining Away
console.log('Scenario 2.6A: P(Sprinkler On | Wet Ground = True)');
const test2_6a = runTest(
  'Scenario 2.6A',
  'Sprinkler On',
  { 'Wet Ground': true },
  [10, 50], // Flexible range
  weatherNetwork
);
console.log(`  ${test2_6a.status}: ${test2_6a.message}`);

console.log('Scenario 2.6B: P(Rain | Wet Ground = True)');
const test2_6b = runTest(
  'Scenario 2.6B',
  'Rain',
  { 'Wet Ground': true },
  [50, 70],
  weatherNetwork
);
console.log(`  ${test2_6b.status}: ${test2_6b.message}`);
// Rain should be more likely than Sprinkler
if (test2_6b.actualProb > test2_6a.actualProb) {
  console.log(`  ✓ PRIOR INFLUENCE: Rain (${test2_6b.actualProb.toFixed(2)}%) > Sprinkler (${test2_6a.actualProb.toFixed(2)}%)\n`);
} else {
  console.log(`  ⚠ WARNING: Rain should be more likely than Sprinkler given priors\n`);
}
results.tests.push({ scenario: '2.6A', ...test2_6a });
results.tests.push({ scenario: '2.6B', ...test2_6b });

// Scenario 2.7: MPE - Simple Case
console.log('Scenario 2.7: MPE with Wet Ground = True');
const test2_7 = runMPETest(
  'Scenario 2.7',
  { 'Wet Ground': true },
  {}, // Flexible - just check it runs
  weatherNetwork
);
console.log(`  ${test2_7.status}: MPE found explanation\n`);
results.tests.push({ scenario: '2.7', ...test2_7 });

// Scenario 2.8: MPE - Strong Evidence
console.log('Scenario 2.8: MPE with Wet Ground = True, People w/ Umbrellas = True');
const test2_8 = runMPETest(
  'Scenario 2.8',
  { 'Wet Ground': true, 'People w/ Umbrellas': true },
  { 'Rain': true, 'Cloudy Sky': true },
  weatherNetwork
);
console.log(`  ${test2_8.status}: ${test2_8.message}\n`);
results.tests.push({ scenario: '2.8', ...test2_8 });

// ============================================================================
// SUMMARY
// ============================================================================

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

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);

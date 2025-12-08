/**
 * Debug test to understand magnitude issue
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const burglarNetwork = JSON.parse(readFileSync(join(__dirname, 'test_cases', 'burglary_alarm_network.json'), 'utf8'));

console.log('\n=== BURGLARY NETWORK STRUCTURE ===\n');
console.log('Nodes:');
burglarNetwork.nodes.forEach(n => {
  console.log(`  ${n.data.label}: P=${n.data.probability}, id=${n.id}`);
});

console.log('\nEdges:');
burglarNetwork.edges.forEach(e => {
  const source = burglarNetwork.nodes.find(n => n.id === e.source);
  const target = burglarNetwork.nodes.find(n => n.id === e.target);
  console.log(`  ${source.data.label} → ${target.data.label}: P=${e.data.probability}`);
});

// Manual calculation for P(Burglary | John=T)
console.log('\n=== MANUAL CALCULATION ===\n');

// P(John=T | Burglary=T)
// = Sum over Earthquake, Alarm, Mary
// Most likely: E=F, A=T, M=T or M=F

const pB = 0.001;
const pE = 0.002;
const pNotB = 1 - pB;
const pNotE = 1 - pE;

console.log('P(Burglary=T) =', pB);
console.log('P(Earthquake=T) =', pE);

// Case 1: B=T, E=F, A=T
const pA_given_BT_EF = 0.95; // From Noisy-OR with Burglary strength
const pJ_given_AT = 0.90;
const prob_case1_BT = pB * pNotE * pA_given_BT_EF * pJ_given_AT;
console.log('\nCase B=T, E=F, A=T: P =', prob_case1_BT.toExponential(4));

// Case 2: B=F, E=F, A=F (most likely when no causes)
const LEAK = 0.0001;
const pA_given_BF_EF = LEAK;
const pJ_given_AF = LEAK;
const prob_case2_BF = pNotB * pNotE * (1 - pA_given_BF_EF) * pJ_given_AF;
console.log('Case B=F, E=F, A=F: P =', prob_case2_BF.toExponential(4));

// Case 3: B=F, E=F, A=T (leak causes alarm)
const prob_case3_BF = pNotB * pNotE * pA_given_BF_EF * pJ_given_AT;
console.log('Case B=F, E=F, A=T: P =', prob_case3_BF.toExponential(4));

console.log('\n--- Posterior Calculation ---');
console.log('P(Burglary=T, John=T) ≈', prob_case1_BT.toExponential(4));
console.log('P(Burglary=F, John=T) ≈', (prob_case2_BF + prob_case3_BF).toExponential(4));

const normalizer = prob_case1_BT + prob_case2_BF + prob_case3_BF;
const posterior = prob_case1_BT / normalizer;

console.log('\nNormalizer =', normalizer.toExponential(4));
console.log('P(Burglary | John=T) =', (posterior * 100).toFixed(2) + '%');

console.log('\n=== EXPECTED: ~90% ===');
console.log('The likelihood ratio (8550:1) should overwhelm the prior!');

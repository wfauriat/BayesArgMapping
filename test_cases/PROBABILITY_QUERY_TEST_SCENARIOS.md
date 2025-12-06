# Probability Query Engine - Test Scenarios

This document provides detailed test scenarios for verifying the Bayesian inference engine implementation in the Argument Mapping application.

---

## Test Case 1: Burglary Alarm Network

### Network Structure

```
Burglary (0.1%) ──0.95──> Alarm ──0.90──> John Calls
                            ↑
Earthquake (0.2%) ─0.29────┘
                                  └──0.70──> Mary Calls
```

**Priors:**
- P(Burglary) = 0.001 (0.1%)
- P(Earthquake) = 0.002 (0.2%)

**Conditional Probabilities (using Noisy-OR):**
- P(Alarm | Burglary=T) = 0.95
- P(Alarm | Earthquake=T) = 0.29
- P(John Calls | Alarm=T) = 0.90
- P(Mary Calls | Alarm=T) = 0.70

### Test Scenario 1.1: Single Evidence - John Calls

**Query:** P(Burglary | John Calls = True)

**Expected Behavior:**
- Prior: P(Burglary) = 0.1%
- Posterior: P(Burglary | John Calls = True) ≈ 0.5-1%
- **Reasoning:** John calling provides weak evidence for burglary, but burglary is still very rare

**Steps:**
1. Import `burglary_alarm_network.json`
2. Open Probability Query → Conditional Query mode
3. Query Node: "Burglary"
4. Evidence: "John Calls" = True
5. Click "Calculate Probability"

**Verification:**
- Check console logs show proper enumeration
- Posterior probability should be small but higher than 0.1%
- Reasoning chain should show evidence propagation through Alarm node

---

### Test Scenario 1.2: Multiple Evidence - Both Neighbors Call

**Query:** P(Burglary | John Calls = True, Mary Calls = True)

**Expected Behavior:**
- Posterior: P(Burglary | John=T, Mary=T) should be **higher** than Scenario 1.1 (≈ 1-3%)
- **Reasoning:** Both neighbors calling provides stronger evidence that the alarm went off, which increases burglary probability

**Steps:**
1. Query Node: "Burglary"
2. Evidence: "John Calls" = True AND "Mary Calls" = True
3. Click "Calculate Probability"

**Verification:**
- Probability should be higher than with just John calling
- Both evidence nodes should appear in reasoning chain
- P(Burglary | John=T, Mary=T) > P(Burglary | John=T)

---

### Test Scenario 1.3: Explaining Away

**Query:** P(Burglary | John Calls = True, Earthquake = True)

**Expected Behavior:**
- Posterior: P(Burglary | John=T, Earthquake=T) should be **lower** than Scenario 1.1
- **Reasoning:** This demonstrates "explaining away" - if we know an earthquake occurred, it explains why John called (alarm went off), so burglary becomes less likely

**Steps:**
1. Query Node: "Burglary"
2. Evidence: "John Calls" = True AND "Earthquake" = True
3. Click "Calculate Probability"

**Verification:**
- P(Burglary | John=T, Earthquake=T) < P(Burglary | John=T)
- Earthquake explains the alarm, reducing need for burglary explanation

---

### Test Scenario 1.4: Direct Evidence

**Query:** P(Burglary | Alarm = True)

**Expected Behavior:**
- Posterior: P(Burglary | Alarm=T) ≈ 3-5%
- **Reasoning:** Knowing the alarm went off directly increases burglary probability, but earthquake is also a possible cause

**Steps:**
1. Query Node: "Burglary"
2. Evidence: "Alarm" = True
3. Click "Calculate Probability"

**Verification:**
- Should be higher than indirect evidence (John/Mary calling)
- Still relatively low due to earthquake alternative

---

### Test Scenario 1.5: Most Probable Explanation

**Evidence:** John Calls = True, Mary Calls = True

**Expected Behavior:**
The MPE should find:
- **Alarm = True** (very likely - both neighbors calling)
- **Burglary = False** (still rare even with evidence)
- **Earthquake = False** (rare event)
- Joint probability of this assignment should be highest

**Steps:**
1. Switch to "Most Probable Explanation" mode
2. Evidence: "John Calls" = True AND "Mary Calls" = True
3. Click "Find MPE"

**Verification:**
- Alarm should be assigned True (explains both calls)
- Burglary and Earthquake likely both False (prior probabilities very low)
- Check reasoning chain shows all assignments

---

## Test Case 2: Weather Prediction Network

### Network Structure

```
Winter (25%) ────0.6───> Cloudy Sky ──0.5──> Rain ──0.95──> Wet Ground
                              ↑                      └─0.85──> People w/ Umbrellas
Low Pressure (30%) ──0.8──────┘

Sprinkler (10%) ────────────────────0.9──────────────> Wet Ground
```

**Priors:**
- P(Winter Season) = 0.25 (25%)
- P(Low Pressure) = 0.30 (30%)
- P(Sprinkler On) = 0.10 (10%)

**Conditional Probabilities (using Noisy-OR):**
- P(Cloudy Sky | Winter=T) = 0.6
- P(Cloudy Sky | Low Pressure=T) = 0.8
- P(Rain | Cloudy Sky=T) = 0.5
- P(Wet Ground | Rain=T) = 0.95
- P(Wet Ground | Sprinkler=T) = 0.9
- P(People w/ Umbrellas | Rain=T) = 0.85

---

### Test Scenario 2.1: Basic Evidence Propagation

**Query:** P(Rain | Wet Ground = True)

**Expected Behavior:**
- Prior: P(Rain) ≈ 20-30% (depends on cloud probability)
- Posterior: P(Rain | Wet Ground=T) ≈ 50-70%
- **Reasoning:** Wet ground has two causes (Rain or Sprinkler). Observing it increases Rain probability.

**Steps:**
1. Import `weather_network.json`
2. Open Probability Query → Conditional Query mode
3. Query Node: "Rain"
4. Evidence: "Wet Ground" = True
5. Click "Calculate Probability"

**Verification:**
- Posterior should be significantly higher than prior
- Console logs should show enumeration over hidden variables
- Reasoning chain should show evidence propagation

---

### Test Scenario 2.2: Explaining Away (Classic)

**Query:** P(Rain | Wet Ground = True, Sprinkler On = True)

**Expected Behavior:**
- From 2.1: P(Rain | Wet Ground=T) ≈ 50-70%
- Now: P(Rain | Wet Ground=T, Sprinkler=T) ≈ 20-40%
- **Reasoning:** **Explaining away** - Sprinkler explains the wet ground, reducing the need for rain to explain it

**Steps:**
1. Query Node: "Rain"
2. Evidence: "Wet Ground" = True AND "Sprinkler On" = True
3. Click "Calculate Probability"

**Verification:**
- **CRITICAL:** P(Rain | Wet Ground=T, Sprinkler=T) < P(Rain | Wet Ground=T)
- This is the classic explaining away pattern
- Sprinkler "explains away" the rain hypothesis

---

### Test Scenario 2.3: Multiple Corroborating Evidence

**Query:** P(Rain | Wet Ground = True, People w/ Umbrellas = True)

**Expected Behavior:**
- Posterior: P(Rain | Wet Ground=T, Umbrellas=T) ≈ 80-95%
- **Reasoning:** Both pieces of evidence point to rain. Umbrellas are 85% correlated with rain, and wet ground is 95% correlated. Together they provide strong evidence.

**Steps:**
1. Query Node: "Rain"
2. Evidence: "Wet Ground" = True AND "People w/ Umbrellas" = True
3. Click "Calculate Probability"

**Verification:**
- Should be **higher** than Scenario 2.1 (single evidence)
- Multiple independent observations compound evidence
- P(Rain | Wet Ground=T, Umbrellas=T) > P(Rain | Wet Ground=T)

---

### Test Scenario 2.4: Explaining Away with Corroboration

**Query:** P(Rain | Wet Ground = True, Sprinkler On = True, People w/ Umbrellas = True)

**Expected Behavior:**
- Posterior: Should be moderate-to-high (≈ 60-80%)
- **Reasoning:** Sprinkler explains wet ground (reducing rain probability), but umbrellas still provide independent evidence for rain

**Steps:**
1. Query Node: "Rain"
2. Evidence: "Wet Ground" = True, "Sprinkler On" = True, "People w/ Umbrellas" = True
3. Click "Calculate Probability"

**Verification:**
- Higher than Scenario 2.2 (due to umbrellas)
- Lower than Scenario 2.3 (due to sprinkler explaining wet ground)
- Demonstrates interaction between explaining away and corroboration

---

### Test Scenario 2.5: Backward Reasoning to Root Causes

**Query:** P(Low Pressure | Rain = True)

**Expected Behavior:**
- Prior: P(Low Pressure) = 30%
- Posterior: P(Low Pressure | Rain=T) ≈ 35-45%
- **Reasoning:** Rain → Cloudy Sky → Low Pressure (80% strength). Observing rain provides moderate evidence for low pressure.

**Steps:**
1. Query Node: "Low Pressure"
2. Evidence: "Rain" = True
3. Click "Calculate Probability"

**Verification:**
- Posterior > Prior (evidence propagates backwards)
- Should also increase P(Winter Season) similarly
- Weaker effect than forward reasoning (diagnostic vs causal)

---

### Test Scenario 2.6: Sprinkler vs Rain (Symmetric Explaining Away)

**Query A:** P(Sprinkler On | Wet Ground = True)
**Query B:** P(Rain | Wet Ground = True)

**Expected Behavior:**
- Both should increase when wet ground is observed
- P(Rain | Wet Ground=T) should be **higher** than P(Sprinkler | Wet Ground=T)
- **Reasoning:** Rain is more common (≈20-30% prior via clouds) than Sprinkler (10% prior)

**Steps:**
1. Query A: Node="Sprinkler On", Evidence="Wet Ground"=True
2. Query B: Node="Rain", Evidence="Wet Ground"=True
3. Compare results

**Verification:**
- Both posteriors > priors
- P(Rain | Wet Ground=T) > P(Sprinkler | Wet Ground=T)
- Demonstrates how prior probabilities affect posterior inference

---

### Test Scenario 2.7: Most Probable Explanation - Simple Case

**Evidence:** Wet Ground = True

**Expected Behavior:**
The MPE should find:
- **Rain = True or False** (depends on whether rain or sprinkler is more likely)
- **Sprinkler On = True or False** (complementary to Rain)
- At least one should be True to explain wet ground
- Joint probability should be maximized

**Steps:**
1. Switch to "Most Probable Explanation" mode
2. Evidence: "Wet Ground" = True
3. Click "Find MPE"

**Verification:**
- Check which explanation is chosen (Rain vs Sprinkler)
- Verify it makes sense given prior probabilities
- If Rain=True, then Cloudy Sky should also be True

---

### Test Scenario 2.8: Most Probable Explanation - Strong Evidence

**Evidence:** Wet Ground = True, People w/ Umbrellas = True

**Expected Behavior:**
The MPE should find:
- **Rain = True** (both pieces of evidence point here)
- **Cloudy Sky = True** (required for rain)
- **Sprinkler On = False** (not needed if rain explains wet ground)
- **Low Pressure** or **Winter Season** = possibly True (helps explain rain)

**Steps:**
1. MPE mode
2. Evidence: "Wet Ground" = True AND "People w/ Umbrellas" = True
3. Click "Find MPE"

**Verification:**
- Rain should definitely be True
- Sprinkler should be False (rain already explains wet ground)
- Cloudy Sky should be True (necessary for rain)
- Check joint probability is high

---

## General Verification Checklist

For each test scenario, verify:

### ✅ Console Output
- [ ] Clear logging with query node and evidence
- [ ] P(query=T, evidence) shown in exponential notation
- [ ] P(query=F, evidence) shown in exponential notation
- [ ] Normalizer calculated correctly
- [ ] Posterior probability percentage displayed

### ✅ UI Display
- [ ] Result summary shows correct probability
- [ ] Evidence nodes listed in reasoning chain
- [ ] Calculation steps visible
- [ ] Method description clear (enumeration vs greedy)
- [ ] Final result highlighted properly

### ✅ Algorithmic Correctness
- [ ] Evidence propagation (forward and backward)
- [ ] Explaining away works correctly (probability decreases)
- [ ] Multiple evidence compounds appropriately
- [ ] Noisy-OR calculation includes leak probability
- [ ] MPE finds coherent explanation

### ✅ Edge Cases
- [ ] No evidence (should return prior)
- [ ] All variables observed (trivial case)
- [ ] Contradictory evidence patterns handled
- [ ] Large networks (>8 nodes) use greedy MPE

---

## Expected Probability Ranges Summary

### Burglary Network
| Query | Evidence | Expected P(Burglary) |
|-------|----------|---------------------|
| (none) | (none) | 0.1% (prior) |
| Burglary | John Calls=T | 0.5-1.5% |
| Burglary | John=T, Mary=T | 1-3% |
| Burglary | John=T, Earthquake=T | 0.1-0.5% (explaining away) |
| Burglary | Alarm=T | 3-5% |

### Weather Network
| Query | Evidence | Expected P(Rain) |
|-------|----------|-----------------|
| (none) | (none) | 20-30% (marginal) |
| Rain | Wet Ground=T | 50-70% |
| Rain | Wet Ground=T, Sprinkler=T | 20-40% (explaining away) |
| Rain | Wet Ground=T, Umbrellas=T | 80-95% (corroboration) |
| Rain | Wet Ground=T, Sprinkler=T, Umbrellas=T | 60-80% (mixed) |

**Note:** Exact values depend on complete enumeration. These ranges are approximations based on the network structure and should be verified empirically.

---

## Testing Protocol

1. **Import network** from JSON test case
2. **Run each scenario** in sequence
3. **Record actual probabilities** in console
4. **Compare with expected ranges**
5. **Verify reasoning chains** make logical sense
6. **Test edge cases** and boundary conditions
7. **Document any discrepancies** for debugging

---

## Known Implementation Details

- **Leak Probability:** 0.0001 (allows effects even when all causes are false)
- **True/False encoding:** 0.99 for True, 0.01 for False (avoids exact 0/1)
- **MPE threshold:** Uses exact enumeration for ≤8 unobserved nodes, greedy otherwise
- **Noisy-OR formula:** P(effect=T) = 1 - (1-leak) × ∏(1-strength_i) for true causes

---

*Last Updated: 2025-12-06*
*Corresponding Implementation: src/utils/probabilityQueries.js*

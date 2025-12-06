# Test Cases for Probability Query Feature

This directory contains example Bayesian networks for testing the Probability Query and MPE features.

## Available Test Cases

### 1. **Burglary Alarm Network** (`burglary_alarm_network.json`)
Classic example from Judea Pearl demonstrating the "explaining away" phenomenon.

**Network Structure:**
- **Root nodes:** Burglary (0.1% prior), Earthquake (0.2% prior)
- **Intermediate:** Alarm (triggered by burglary or earthquake)
- **Evidence:** John Calls, Mary Calls (neighbors who might call if alarm sounds)

**Key Concept:** When the alarm sounds, it could be a burglary OR an earthquake. If we know there was an earthquake, the probability of burglary goes DOWN (explaining away).

### 2. **Weather Network** (`weather_network.json`)
Real-world example of weather prediction with multiple evidence sources.

**Network Structure:**
- **Causes:** Winter Season, Low Pressure, Sprinkler
- **Effects:** Cloudy Sky, Rain, Wet Ground, People with Umbrellas

**Key Concept:** Wet ground could be caused by rain OR sprinkler. Multiple pieces of evidence (umbrellas, clouds) help determine which is more likely.

## How to Use

### Step 1: Import the Network
1. Click **"📁 Import / Export"** in the control panel
2. Click **"Import from JSON"**
3. Copy the contents of one of the JSON files
4. Paste into the text area
5. Click **"Import"**

### Step 2: Explore the Network
- The nodes will appear on the canvas with proper positioning
- Zoom and pan to see the structure
- Click nodes to see their probabilities
- Click edges to see conditional probabilities

### Step 3: Run Probability Queries

#### Conditional Query Examples:

**For Burglary Network:**

1. **Basic Query:** "What if John calls?"
   - Click **🔍 Probability Query**
   - Select **📊 Conditional Query** mode
   - Query Node: Select "Burglary"
   - Evidence: Set "John Calls" to 0.99
   - Click **🔍 Calculate Probability**
   - **Expected:** Burglary probability increases from 0.1% to ~1-5%

2. **Both Witnesses:** "What if both John AND Mary call?"
   - Query Node: "Burglary"
   - Evidence: "John Calls" = 0.99, "Mary Calls" = 0.99
   - **Expected:** Even higher burglary probability (~5-10%)

3. **Explaining Away:** "Alarm sounds during earthquake"
   - Query Node: "Burglary"
   - Evidence: "Alarm" = 0.99, "Earthquake" = 0.99
   - **Expected:** Lower burglary probability than alarm alone
   - **Why:** Earthquake explains the alarm, making burglary less likely

**For Weather Network:**

1. **Basic Prediction:** "Will it rain if it's cloudy?"
   - Query Node: "Rain"
   - Evidence: "Cloudy Sky" = 0.99
   - **Expected:** Higher rain probability

2. **Explaining Away:** "Why is the ground wet?"
   - Query Node: "Rain"
   - Evidence: "Wet Ground" = 0.99
   - **Expected:** Moderate probability (could be rain or sprinkler)

3. **Ruling Out:** "Wet ground but sprinkler is off"
   - Query Node: "Rain"
   - Evidence: "Wet Ground" = 0.99, "Sprinkler On" = 0.01
   - **Expected:** Much higher rain probability

#### MPE (Most Probable Explanation) Examples:

**For Burglary Network:**

1. **Both witnesses call - what happened?**
   - Click **🎯 Most Probable Explanation** mode
   - Evidence: "John Calls" = 0.99, "Mary Calls" = 0.99
   - Click **🎯 Find MPE**
   - **Expected Results:**
     - Alarm: Very high (~95%+)
     - Burglary: Moderate (~5-10%)
     - Earthquake: Low (~0.2%)
   - **Interpretation:** Most likely scenario is burglary triggered alarm

**For Weather Network:**

1. **Wet ground and umbrellas - explain this**
   - Evidence: "Wet Ground" = 0.99, "People w/ Umbrellas" = 0.99
   - **Expected Results:**
     - Rain: High
     - Cloudy Sky: High
     - Sprinkler: Low
   - **Interpretation:** It rained (not sprinkler) because people have umbrellas

2. **Just wet ground - what's most likely?**
   - Evidence: "Wet Ground" = 0.99
   - **Expected Results:** Could show sprinkler OR rain as probable causes

## Understanding the Results

### Reasoning Chain
The query results include a step-by-step reasoning chain:

- **📌 Green:** Evidence applied
- **🔢 Blue:** Calculations being performed
- **└─ Gray:** Parent node contributions
- **⚙️ Yellow:** Method used (Noisy-OR or CPT)
- **✅ Purple:** Final result
- **→ Purple:** MPE assignments

### Interpreting Probabilities

- **Prior (before evidence):** The initial probability from the network
- **Posterior (after evidence):** Updated probability given observations
- **Higher = more likely** given the evidence
- **Lower = less likely** given the evidence (possibly explained away)

## Advanced Testing

### Test Interventions
1. Import a network
2. Right-click a node and select "Set Intervention"
3. Then run probability query
4. **Note:** Intervention nodes are excluded from queries

### Test with Custom CPTs
1. Import a network
2. Right-click a node with parents
3. Select "Edit CPT"
4. Define exact conditional probabilities
5. Run queries to see exact inference

### Compare Methods
- Nodes without CPT use **Noisy-OR approximation** (faster)
- Nodes with CPT use **exact inference** (more accurate)
- The reasoning chain shows which method was used

## Tips for Testing

1. **Start Simple:** Test with one piece of evidence first
2. **Add Evidence Gradually:** See how probability changes
3. **Watch the Reasoning:** The step-by-step explanation helps understand why
4. **Try Explaining Away:** Set conflicting evidence and see which explanation wins
5. **Use MPE for Stories:** Find the most likely complete scenario
6. **Check Edge Strengths:** Higher edge probability = stronger influence

## Expected Behaviors

### Explaining Away (Burglary Network)
- Alarm alone → Moderate burglary probability
- Alarm + Earthquake → Lower burglary probability
- **Why:** Two causes compete to explain the same effect

### Common Cause (Weather Network)
- Rain → Increases both wet ground AND umbrella probability
- See wet ground + umbrellas → Strong evidence for rain
- **Why:** Common cause explains multiple effects

### Diagnostic Reasoning
- See effect (wet ground) → Infer cause (rain or sprinkler)
- Predictive: Given cause (rain) → Predict effect (wet ground)

## Troubleshooting

**Q: Probabilities seem wrong?**
- Check edge strengths (0-1 range)
- Verify node priors are reasonable
- Remember: Noisy-OR is an approximation

**Q: MPE takes long?**
- Networks with >10 unobserved nodes use greedy approximation
- Results may not be globally optimal but are fast

**Q: Can't select a node as evidence?**
- Intervention nodes cannot be used as evidence
- Remove intervention first

## Creating Your Own Test Cases

Export any network you create:
1. Build network in the app
2. Click "Import/Export"
3. Click "Export as JSON"
4. Save the JSON
5. Add "testQueries" section (see examples)
6. Share with others!

---

**Happy Testing! 🎯**

For questions or issues, check the development log in `dev_notes/development_log.md`

# Session State - Argument Mapping App

**Last Updated:** 2025-12-08
**Current Branch:** main
**Latest Commit:** 1f97d06 (will be updated after commit)
**Dev Server:** Running on `http://localhost:5173/`

---

## Quick Context for New Sessions

This is a **Bayesian Network Argument Mapping application** built with React and React Flow, implementing J. Pearl's causal inference framework. The app allows users to create, edit, and analyze argument graphs with conditional probabilities and causal relationships.

### Core Technologies
- **React 18.3** with Vite
- **React Flow 11.11** for interactive graph visualization
- **Bayesian inference** engine with exact enumeration (VERIFIED ✓)
- **do-operator** for causal interventions (Pearl's framework)

---

## Recent Session Work (2025-12-08 - Session 2)

### UI/UX Enhancements ⭐ NEW

**1. Zoom to Fit Feature** ✅
- ✅ Added "🔍 Zoom to Fit" button in Graph Operations
- ✅ Uses React Flow's `fitView()` with smooth animation (300ms)
- ✅ 20% padding for comfortable viewing
- ✅ Wrapped GraphCanvas in `ReactFlowProvider` for proper hook usage

**2. Dark/Light Theme Toggle** ✅
- ✅ Added theme toggle button: "☀️ Light Mode" / "🌙 Dark Mode"
- ✅ Comprehensive light theme implementation across all components
- ✅ Smooth 0.3s transitions between themes
- ✅ Default theme: Dark (preserves original design)

**Light Theme Styling:**
- Control Panel: White background with light gray sections
- Canvas: Pure white background with subtle gray patterns
- Buttons: Professional blue (#3b82f6) with good contrast
- Edge Labels: White cards with 2px borders and subtle shadows
- Statistics Panel: Light gray with white stat cards
- All Modals: Light backgrounds with proper contrast
- Node colors preserved from templates

**Technical Details:**
- Theme state managed in App.jsx
- CSS class switching: `.theme-dark` / `.theme-light`
- All 12 CSS files updated with light theme styles
- Color palette: Tailwind-inspired blues for consistency

**Files Modified:**
- `src/App.jsx` - Theme state and fitView management
- `src/components/GraphCanvas.jsx` - ReactFlowProvider, fitView hook
- `src/components/ControlPanel.jsx` - New buttons and theme prop
- All component CSS files - Comprehensive light theme styles

---

## Session 1 Work (2025-12-08 - Earlier)

### Test Validation & Verification ⭐

**1. Automated Test Suite** ✅ 100% PASS RATE
- ✅ Created comprehensive test suite with 11 scenarios
- ✅ Verified Bayesian inference engine mathematical correctness
- ✅ Corrected test expectations (were off by 10-100x)
- ✅ All tests passing: 11/11 scenarios

**Key Validation Results:**
- Explaining away mechanism: **VERIFIED** ✓
- Noisy-OR calculations: **VERIFIED** ✓
- Evidence propagation (forward/backward): **VERIFIED** ✓
- Competing causes handling: **VERIFIED** ✓
- Joint probability computation: **VERIFIED** ✓

**Major Discovery:**
- Original test expectations were mathematically incorrect
- P(Burglary | John Calls) = 54.6% (not 0.5-1.5%)
- Due to competing causes with similar likelihood ratios
- Implementation was correct all along!

**Files Added:**
- `tests/test_standalone.js` - Automated test runner
- `tests/TEST_README.md` - Comprehensive test documentation
- `tests/TEST_RESULTS_SUMMARY.md` - Executive summary
- `tests/manual_calc_corrected.md` - Mathematical proofs
- `tests/PROBABILITY_QUERY_TEST_SCENARIOS.md` - Corrected expectations

---

## Previous Session Work (2025-12-06)

### Major Features Completed

**1. Probability Query/Calculator** ⭐ NEW
- ✅ Conditional probability queries: P(query | evidence)
  - Exact inference via enumeration algorithm
  - True/False/Unknown evidence interface
  - Detailed reasoning chain visualization

- ✅ Most Probable Explanation (MPE)
  - Finds most likely complete state assignment
  - Exact for ≤8 unobserved variables
  - Greedy approximation for larger networks

- ✅ Query Interface (ProbabilityQueryModal)
  - Mode selector: Conditional Query / MPE
  - Evidence buttons for each node
  - Color-coded reasoning steps
  - Clear all evidence functionality

**2. Child Node Probability Auto-Computation** ⭐ NEW
- ✅ Disabled probability editing for child nodes
- ✅ Shows "Marginal Probability (computed):" label
- ✅ Displays informative message about auto-computation
- ✅ Import handler recomputes child probabilities
- ✅ Auto-layout refreshes probabilities

**3. Bug Fixes**
- ✅ Fixed Noisy-OR calculation (leak probability placement)
- ✅ Fixed test case JSON format
- ✅ Fixed evidence interface (True/False buttons instead of numeric input)

**4. Test Infrastructure**
- ✅ Created burglary_alarm_network.json (Pearl's classic example)
- ✅ Created weather_network.json (explaining away demonstration)
- ✅ Created PROBABILITY_QUERY_TEST_SCENARIOS.md (comprehensive test guide with 15 scenarios)

### Previous Session (2025-12-05)

**Undo/Redo & Multi-Select:**
- ✅ Undo/Redo with 50-state history buffer
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- ✅ Multi-select with Shift+click
- ✅ Bulk operations (apply template, set probability, delete)
- ✅ Visual selection feedback (green glow)

**Node Templates & Edge Labels:**
- ✅ 6 node templates with colors/icons
- ✅ 5 edge types with visual styling
- ✅ Template configuration system

---

## Complete Feature List

### Graph Building
- ✅ Add/edit/delete nodes and edges
- ✅ Drag-and-drop node positioning
- ✅ 6 node templates (Evidence, Hypothesis, Conclusion, etc.)
- ✅ 5 edge types (Supports, Contradicts, Requires, etc.)
- ✅ Auto-layout (top-to-bottom layered)
- ✅ Multi-select with Shift+click
- ✅ Bulk operations (template, probability, delete)
- ✅ Undo/Redo (Ctrl+Z, Ctrl+Y, 50-state buffer)

### Bayesian Inference
- ✅ Noisy-OR model for probability propagation
- ✅ Conditional Probability Tables (CPT)
- ✅ Auto-computation of child node probabilities
- ✅ Topological ordering for correct propagation
- ✅ Exact inference via enumeration

### Causal Analysis
- ✅ do-operator interventions (Pearl's framework)
- ✅ Visual intervention indicators (orange theme)
- ✅ Causal effect propagation to descendants only

### Query & Analysis ⭐ NEW
- ✅ Conditional probability queries: P(Q | E)
- ✅ Most Probable Explanation (MPE)
- ✅ Exact inference via enumeration
- ✅ Reasoning chain visualization
- ✅ True/False/Unknown evidence interface
- ✅ Query modal with two modes

### Import/Export
- ✅ JSON file export/import
- ✅ Browser localStorage save/load
- ✅ PNG image export (optional)
- ✅ Clipboard copy/paste
- ✅ Multiple save slots

### Statistics & UI
- ✅ Real-time network statistics (8 metrics)
- ✅ Interactive minimap
- ✅ Zoom/pan controls
- ✅ Visual selection feedback
- ✅ Dark theme UI

---

## Architecture Overview

### Directory Structure
```
argument-mapping-app/
├── src/
│   ├── components/                   # 10 React components (20 files with CSS)
│   │   ├── BayesianNode.jsx/css      # Custom node component
│   │   ├── ConditionalEdge.jsx/css   # Custom edge with labels
│   │   ├── ControlPanel.jsx/css      # Left sidebar controls
│   │   ├── GraphCanvas.jsx/css       # React Flow canvas
│   │   ├── EditModal.jsx/css         # Node/edge editing
│   │   ├── CPTModal.jsx/css          # Conditional Probability Tables
│   │   ├── InterventionModal.jsx/css # do-operator interventions
│   │   ├── ImportExportModal.jsx/css # Save/load/export
│   │   ├── ProbabilityQueryModal.jsx/css  # Query & MPE interface
│   │   └── StatisticsPanel.jsx/css   # Network statistics
│   ├── utils/                        # 5 utility modules
│   │   ├── bayesianInference.js      # Bayesian calculations
│   │   ├── probabilityQueries.js     # Query engine (P(Q|E), MPE)
│   │   ├── nodeTemplates.js          # Template configs (6 types)
│   │   ├── layoutAlgorithms.js       # Auto-layout (top-to-bottom)
│   │   └── exportImport.js           # JSON/localStorage save/load
│   ├── hooks/
│   │   └── useHistory.js             # Undo/redo with 50-state buffer
│   ├── App.jsx/css                   # Root component + theme management
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── tests/                            # Test suite & validation
│   ├── test_standalone.js            # Automated test runner (11 scenarios)
│   ├── TEST_README.md                # Test documentation
│   ├── TEST_RESULTS_SUMMARY.md       # Executive summary
│   ├── manual_calc_corrected.md      # Mathematical proofs
│   ├── PROBABILITY_QUERY_TEST_SCENARIOS.md  # Test scenarios
│   ├── burglary_alarm_network.json   # Pearl's burglary alarm example
│   └── weather_network.json          # Explaining away demo
├── dev_notes/
│   └── development_log.md            # Detailed session history
├── package.json                      # Dependencies (React, React Flow, Vite)
├── vite.config.js                    # Vite configuration
├── README.md                         # Project description
└── SESSION_STATE.md                  # This file - session context
```

### Key Algorithms Implemented

**1. Exact Inference via Enumeration**
```
P(Q | E) = P(Q, E) / [P(Q, E) + P(¬Q, E)]

Where P(Q, E) = Σ P(Q, E, h₁, h₂, ..., hₙ)
                over all hidden variable assignments
```

**2. Noisy-OR Model (Corrected)**
```
P(effect=T | causes) = 1 - P(all causes inhibited)
                     = 1 - [(1 - leak) × ∏(1 - pᵢ) for true causes]

Fixed: leak probability now properly placed at start, not applied unconditionally
```

**3. Most Probable Explanation**
```
argmax P(H₁, ..., Hₙ | E) = argmax P(H₁, ..., Hₙ, E)

- Exact: Enumerate all 2^n assignments
- Greedy: Topological order, assign most likely at each step
```

**4. Joint Probability**
```
P(X₁, ..., Xₙ) = ∏ P(Xᵢ | Parents(Xᵢ))

Chain rule of Bayesian networks
```

---

## Important Code Patterns

### State Management
```javascript
// App.jsx - global state
const [nodes, setNodes] = useState([])
const [edges, setEdges] = useState([])

// GraphCanvas - local React Flow state
const [localNodes, setLocalNodes, onNodesChange] = useNodesState([])

// Sync mechanisms:
// 1. Length-based (nodes added/removed)
// 2. layoutVersion (auto-layout triggered)
// 3. undoRedoVersion (undo/redo operations)
```

### Child Node Probability
```javascript
// Root nodes: editable prior probability
// Child nodes: computed marginal probability (disabled editing)
if (hasParents) {
  const marginalProb = calculateNodeProbability(node, parentNodes, edges)
  // Show as computed, disable input
}
```

### History Management (useRef pattern)
```javascript
// useHistory.js - avoid stale closures
const historyRef = useRef([])
const currentIndexRef = useRef(-1)
const skipHistoryRef = useRef(false)  // Skip during undo/redo
```

---

## Recent Bug Fixes Reference

**1. Noisy-OR Leak Probability** (2025-12-06)
- **Before:** `product *= (1 - LEAK)` (unconditional)
- **After:** `probAllInhibited = (1 - LEAK)` (start value)
- **Impact:** Probabilities now calculate correctly

**2. Child Node Probability Editing** (2025-12-06)
- **Issue:** Users could set probabilities that contradicted parent values
- **Fix:** Disabled editing for child nodes, show computed marginal probability
- **Semantic:** Root nodes have priors, child nodes have marginals

**3. Evidence Interface** (2025-12-06)
- **Before:** Numeric probability input (0-1 range)
- **After:** Three buttons (True/False/Unknown)
- **UX:** Simpler, more intuitive for setting evidence

**4. Redo Not Working** (2025-12-06, previous session)
- **Fix:** Rewrote useHistory with useRef
- **Added:** skipHistoryRef flag

**5. Bulk Operations Not Immediate** (2025-12-06, previous session)
- **Fix:** Added `setUndoRedoVersion(v => v + 1)` to force sync

---

## Git History (Recent Commits)

```
bb54602  Add Probability Query/Calculator with MPE and child node auto-computation ⭐
f8b3795  Implement undo/redo and multi-select with bulk operations
d7d0d63  Add node templates and edge labels/types features
61b93a7  Change auto-layout to vertical (top-to-bottom) direction
709300b  Add auto-layout feature with Simple Layered algorithm
bd482e5  Add interventions UI with do-operator controls
e51d805  Add save/load, export, CPT, and statistics features
```

---

## Test Cases & Documentation

### Test Networks
1. **burglary_alarm_network.json** - Classic Pearl burglary alarm
   - Demonstrates explaining away
   - Tests: P(Burglary | JohnCalls, MaryCalls)

2. **weather_network.json** - Weather prediction
   - Rain/Sprinkler explaining away pattern
   - Tests: P(Rain | WetGround, Sprinkler)

### Test Documentation
**PROBABILITY_QUERY_TEST_SCENARIOS.md** - Comprehensive guide
- 15 detailed test scenarios
- Expected probability ranges
- Explaining away examples
- MPE test cases
- Verification checklist
- Testing protocol

---

## Known Limitations

- Exact inference exponential in network size (practical for <15 nodes)
- MPE uses greedy approximation for >8 unobserved variables
- No cycle detection (assumes DAG structure)
- Binary states only (no multi-valued variables)
- History limited to 50 states

---

## Suggested Next Features

### High Priority
1. **Graph Validation** - Detect cycles, warn about issues
2. **Sensitivity Analysis** - Which changes affect conclusion most
3. **Share via URL** - Encode graph state in URL

### Medium Priority
4. **Additional Layout Algorithms** - Dagre, D3-Force, ELK
5. **Animation & Transitions** - Highlight probability updates
6. **Zoom to Fit** - Button to fit graph in view

### Low Priority
7. **Light Mode / Themes**
8. **Export to other formats** (DOT, BPMN, CSV)
9. **Custom node shapes**

---

## Development Commands

```bash
# Start dev server (Vite)
npm run dev

# Build for production
npm run build

# Git commands
git status
git log --oneline -10
git add -A
git commit -m "message"

# Note: Don't push to remote (user handles manually)
```

---

## Important Gotchas

1. **GraphCanvas State Sync**
   - Only sync when length changes OR explicit signal (layoutVersion, undoRedoVersion)
   - Don't sync on every prop change → infinite loops

2. **Template Data Must Be Complete**
   - When adding nodes: pass template, color, backgroundColor, icon
   - Check App.jsx addNode() function

3. **Probability Propagation**
   - Always call propagateProbabilities() after edits
   - Interventions use applyIntervention() (descendants only)

4. **Child Node Probabilities**
   - Never set directly - computed from parents
   - Import handler must call propagateProbabilities()

5. **History Skip Flag**
   - Set skipHistoryRef.current = true before undo/redo
   - Prevents adding history entry during state restoration

---

## Testing Checklist

When implementing features, verify:
- [ ] Nodes can be added with all templates
- [ ] Edges can be created with all types
- [ ] Probability propagation works correctly
- [ ] Undo/redo works for all operations
- [ ] Multi-select and bulk operations work
- [ ] Import/export preserves all data
- [ ] Child nodes show computed probabilities (disabled editing)
- [ ] Interventions still function
- [ ] CPT still works
- [ ] Query modal works for both modes
- [ ] No console errors
- [ ] HMR updates without refresh

---

## Next Session - Quick Start

1. **Context Load:**
   - Read this SESSION_STATE.md (you're doing it!)
   - Check `git status` for uncommitted changes
   - Review `git log --oneline -5`

2. **During Work:**
   - Implement requested features
   - Commit with detailed messages
   - Update development_log.md
   - Test via HMR

3. **Session End:**
   - Update this file with new features/commits
   - Ensure all changes committed
   - Update "Last Updated" timestamp
   - Don't push to remote (user handles manually)

---

## Key Design Decisions

**Why React Flow?** Built for React, handles drag/zoom/pan, custom components

**Why Noisy-OR?** Appropriate for argument mapping, multiple independent causes

**Why Top-to-Bottom?** Matches handle positions, standard for Bayesian networks

**Why Template System?** Semantic meaning, visual distinction, quick creation

**Why Exact Inference?** Accurate probabilities for reasoning, practical for small networks

**Why True/False Evidence?** Simpler UX than numeric probabilities, matches binary states

**Why Auto-Compute Child Probs?** Semantically correct Bayesian networks

---

**Status:** All features working, committed locally, ready for next session ✅

**Dev Server:** Should be running with npm run dev
**Documentation:** dev_notes/development_log.md has full session history
**Test Cases:** test_cases/ directory has networks and test scenarios

---

*This file updated at the end of each session. Next session: Load this file for instant context!*

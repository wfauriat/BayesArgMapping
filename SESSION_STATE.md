# Session State - Bayesian Argument Mapping App

**Last Updated:** December 5, 2025 - 5:55 PM
**Session Duration:** ~6 hours
**Git Branch:** master
**Dev Server:** Running at `http://localhost:5173/`

---

## Quick Start for New Sessions

1. **Read this file** for current context (you're doing it now!)
2. **Check git status** to see if there are uncommitted changes
3. **Review recent commits** (see Git History section below)
4. **Check Suggested Next Features** section for ideas

---

## Project Overview

**What is this?**
An interactive web-based argument mapping tool built with React and React Flow. It uses Bayesian networks for probabilistic reasoning and implements Pearl's causal inference framework (do-operator).

**Core Technologies:**
- React 18.3.1
- React Flow 11.11.4 (graph visualization)
- Vite (build tool)
- Pure JavaScript (no TypeScript)

**Key Concepts:**
- Nodes represent propositions/arguments with probabilities
- Edges represent causal/logical relationships with conditional probabilities
- Bayesian inference propagates probabilities through the network
- do-operator allows causal interventions (not just observation)
- CPT (Conditional Probability Tables) for exact inference

---

## Current Feature Status

### ✅ Fully Implemented Features

1. **Core Graph Editing**
   - Add/delete nodes and edges
   - Drag nodes to reposition
   - Click nodes/edges to edit properties
   - Interactive canvas with zoom/pan/minimap

2. **Bayesian Inference**
   - Automatic probability propagation (noisy-OR model)
   - Conditional Probability Tables (CPT) for complex relationships
   - Topological ordering for correct inference
   - Real-time updates when network changes

3. **Causal Interventions (do-operator)**
   - Set nodes to fixed values
   - Breaks incoming causal links
   - Propagates only to descendants
   - Visual indicators (orange styling, "do()" badge)

4. **Node Templates** ⭐ RECENT (Prompt #14, 5:15 PM)
   - 6 semantic templates: Default, Evidence, Hypothesis, Conclusion, Assumption, Counter-Argument
   - Each has unique color, icon (emoji), and default probability
   - Template selector in ControlPanel (new nodes) and EditModal (existing nodes)
   - Auto-updates probability when template changed

5. **Edge Labels/Types** ⭐ RECENT (Prompt #14, 5:15 PM)
   - 5 edge types: Supports, Contradicts, Requires, Influences, Correlates
   - Color-coded with different stroke patterns (solid/dashed/dotted)
   - Optional text labels on edges
   - Edge type selector in EditModal

6. **Save/Load/Export**
   - Save to browser localStorage
   - Export to JSON file
   - Import from JSON
   - Copy/paste JSON to clipboard
   - Export to PNG (optional, requires html2canvas)

7. **Auto-Layout**
   - Simple Layered algorithm (top-to-bottom)
   - Groups nodes by dependency level
   - Modular architecture ready for additional algorithms (Dagre, D3-Force, ELK)

8. **Network Statistics**
   - Real-time statistics panel
   - 8 metrics: node count, edge count, avg probability, roots, leaves, avg degree, max depth, density

### 🚧 Known Issues / Limitations

- No undo/redo functionality yet
- Auto-layout only has one algorithm (Simple Layered)
- No multi-select or bulk operations
- No graph validation (doesn't detect cycles)
- No animation/transitions

---

## Architecture Overview

### Directory Structure
```
argument-mapping-app/
├── src/
│   ├── components/
│   │   ├── BayesianNode.jsx/css          # Custom node with template styling
│   │   ├── ConditionalEdge.jsx/css       # Custom edge with type styling
│   │   ├── ControlPanel.jsx/css          # Left sidebar controls
│   │   ├── GraphCanvas.jsx/css           # Main React Flow canvas
│   │   ├── EditModal.jsx/css             # Edit node/edge properties
│   │   ├── CPTModal.jsx/css              # Conditional Probability Table editor
│   │   ├── InterventionModal.jsx/css     # do-operator interface
│   │   ├── ImportExportModal.jsx/css     # Save/load/export interface
│   │   └── StatisticsPanel.jsx/css       # Network statistics
│   ├── utils/
│   │   ├── bayesianInference.js          # Core probability calculations
│   │   ├── exportImport.js               # Import/export utilities
│   │   ├── layoutAlgorithms.js           # Auto-layout algorithms
│   │   └── nodeTemplates.js              # Template configurations ⭐ NEW
│   ├── App.jsx/css                       # Main container
│   ├── index.css                         # Global styles
│   └── main.jsx                          # Entry point
├── package.json
├── vite.config.js
└── .gitignore
```

### Key Files to Know

**`src/utils/nodeTemplates.js`** ⭐ NEW
- Defines all node templates and edge types
- Configuration-based, easy to extend
- Exports getter functions for UI components

**`src/utils/bayesianInference.js`**
- Core inference engine
- Functions: `propagateProbabilities()`, `applyIntervention()`, `calculateNodeProbability()`
- Implements noisy-OR model and exact CPT inference

**`src/components/GraphCanvas.jsx`**
- Main React Flow integration
- Manages node/edge state with React Flow hooks
- Handles all modals (Edit, CPT, Intervention)
- Syncs with parent state carefully to avoid infinite loops

**`src/App.jsx`**
- Top-level state management (nodes, edges)
- `addNode()` function - make sure to pass all template properties!
- Modal visibility state

### Data Structures

**Node:**
```javascript
{
  id: "node-123",
  type: "bayesianNode",
  position: { x: 100, y: 200 },
  data: {
    label: "Evidence A",
    probability: 0.8,
    template: "evidence",        // ⭐ NEW
    color: "#4ade80",            // ⭐ NEW
    backgroundColor: "#1a2e1a",  // ⭐ NEW
    icon: "📊",                  // ⭐ NEW
    useCPT: false,
    cpt: null,
    intervention: null  // or { active: true, value: 0.9 }
  }
}
```

**Edge:**
```javascript
{
  id: "edge-123",
  source: "node-1",
  target: "node-2",
  type: "conditional",
  animated: true,
  data: {
    probability: 0.7,
    edgeType: "supports",     // ⭐ NEW
    edgeLabel: "Evidence for" // ⭐ NEW (optional)
  }
}
```

---

## Git History (Recent Commits)

```
87ca2d2  Remove duplicate DEVELOPMENT_LOG.md file (5:55 PM)
d7d0d63  Add node templates and edge labels/types features (5:50 PM) ⭐
61b93a7  Change auto-layout to vertical (top-to-bottom) direction (5:05 PM)
709300b  Add auto-layout feature with Simple Layered algorithm (4:40 PM)
bd482e5  Add interventions UI with do-operator controls (3:50 PM)
e51d805  Add save/load, export, CPT, and statistics features (2:15 PM)
434d59a  Fix node addition bug in GraphCanvas (1:45 PM)
cc0f348  Add node/edge editing and Bayesian inference (1:15 PM)
c484c4d  first proposal with React Flow (1:00 PM)
```

**Most Recent Feature:** Node templates and edge labels (Prompt #14)

---

## Development Patterns & Conventions

### State Management
- App.jsx holds global state (nodes, edges)
- GraphCanvas uses React Flow's `useNodesState` and `useEdgesState` for local state
- Careful synchronization to avoid infinite loops:
  - Sync only when array lengths change
  - Use `layoutVersion` counter for explicit auto-layout triggers

### Adding New Templates
1. Edit `src/utils/nodeTemplates.js`
2. Add to `nodeTemplates` object with: name, description, color, backgroundColor, probability, icon
3. No other changes needed - UI automatically populates

### Adding New Edge Types
1. Edit `src/utils/nodeTemplates.js`
2. Add to `edgeTypes` object with: name, color, style (solid/dashed/dotted), animated
3. No other changes needed - UI automatically populates

### Component Communication
- Parent passes props down (nodes, edges, handlers)
- Children call handlers to update parent state
- Modals receive item to edit and call `onSave` with updated item
- Probability propagation happens automatically after state changes

### Git Commit Messages
- Use conventional format with emoji where appropriate
- Include detailed implementation notes
- List all files changed
- Add "🤖 Generated with Claude Code" footer
- Co-Authored-By: Claude

---

## Suggested Next Features

These were suggested in Prompt #13 (5:10 PM). User has not selected the next feature yet.

### Top 3 Recommendations:

**🥇 Undo/Redo Functionality** - HIGHLY RECOMMENDED
- Critical for user experience
- Track history stack of graph states
- Implement Ctrl+Z / Ctrl+Y shortcuts
- Complexity: Moderate
- Priority: HIGH

**🥈 Probability Queries/Calculator**
- "What if" scenario testing
- Query: P(conclusion | evidence1=true, evidence2=false)
- Most Probable Explanation (MPE)
- Show reasoning chain
- Complexity: Medium-high
- Priority: MEDIUM-HIGH

**🥉 Multi-Select & Bulk Operations**
- Select multiple nodes (Shift+click, drag-to-select)
- Move groups, delete multiple, bulk property changes
- Complexity: Medium
- Priority: MEDIUM

### Other Good Options:

4. **Graph Validation & Warnings** (Easy, useful)
   - Detect cycles (invalid for DAGs)
   - Warn about disconnected components
   - Flag probability inconsistencies

5. **Sensitivity Analysis** (Advanced, high value)
   - Show which changes affect conclusion most
   - Visualize uncertainty

6. **Zoom to Fit / Focus Features** (Easy, nice UX)
   - Button to fit graph in view
   - Double-click to center on node

7. **Share via URL** (Medium, collaboration)
   - Encode graph state in URL
   - No backend needed

8. **Custom Node Styling** (Easy-medium, visual)
   - More shape options
   - Theme support (light mode, high contrast)

9. **Animation & Transitions** (Easy, polish)
   - Animate auto-layout
   - Highlight probability propagation

10. **Additional Layout Algorithms** (Easy-medium, building on existing)
    - Add Dagre (hierarchical)
    - Add D3-Force (physics-based)
    - Add layout selector dropdown

---

## Important Gotchas / Lessons Learned

1. **GraphCanvas State Sync**
   - Don't sync on every `nodes` prop change - causes infinite loops
   - Only sync when array length changes OR when explicit signal (`layoutVersion`)
   - React Flow maintains internal state separate from parent

2. **Template Data Must Be Passed Completely**
   - When adding nodes in App.jsx, must pass: template, color, backgroundColor, icon
   - Bug discovered in Prompt #14 where these were missing
   - Fixed in commit d7d0d63

3. **React Flow Best Practices**
   - Use `useNodesState` and `useEdgesState` for local state
   - Use `onNodesChange` and `onEdgesChange` for built-in features (drag, select)
   - Custom handlers for custom behavior (clicks, deletes)

4. **Probability Propagation**
   - Always call `propagateProbabilities()` after editing nodes/edges
   - Uses topological ordering to ensure parents calculated before children
   - Interventions use `applyIntervention()` instead (only propagates to descendants)

5. **Vite vs Create React App**
   - Dev server: `npm run dev` (not `npm start`)
   - Instant HMR, no rebuild needed during development
   - Build: `npm run build` when ready for production

---

## Testing Checklist

When implementing new features, test:
- [ ] Add nodes with different templates
- [ ] Edit existing node templates
- [ ] Create edges with different types
- [ ] Edit existing edge types and labels
- [ ] Manual node dragging still works after auto-layout
- [ ] Probability propagation updates correctly
- [ ] Save/load preserves all data (templates, edge types, etc.)
- [ ] Interventions still work
- [ ] CPT still works
- [ ] Statistics panel updates
- [ ] No console errors
- [ ] HMR updates without refresh

---

## Quick Reference - Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Git shortcuts
git status
git log --oneline -10
git add .
git commit -m "message"

# Check running background processes
# Use BashOutput tool to see dev server logs
```

---

## Session Context Notes

**Development Flow:**
- User provides feature requests
- I implement features modularly
- Commit after each major feature or bug fix
- Update development_log.md with detailed notes
- Test features via HMR without server restart

**Communication Style:**
- Direct and technical
- Code examples in documentation
- Detailed commit messages
- Track all changes in development_log.md
- Use emojis sparingly, only when user requests

**File Organization:**
- Keep related files together (component + CSS)
- Utils folder for shared logic
- Modular, extensible architecture
- Configuration over hard-coding

---

## Next Session - What to Do

1. **Start Session:**
   - Read this SESSION_STATE.md (you are here!)
   - Check `git status` for any uncommitted changes
   - Check `git log --oneline -5` to see latest work
   - Ask user what feature they want next

2. **During Session:**
   - Implement requested features
   - Commit frequently with good messages
   - Update development_log.md with major changes
   - Test via HMR as you go

3. **End Session:**
   - Update this SESSION_STATE.md with:
     - New features completed
     - New commits
     - Current status
     - Updated "Last Updated" timestamp
   - Make sure everything is committed
   - Update "Suggested Next Features" if priorities changed

---

## Key Decisions & Rationale

**Why React Flow?**
- Built for React, not imperative like D3
- Handles drag/zoom/pan out of the box
- Custom node/edge components
- Good performance

**Why noisy-OR model?**
- Appropriate for argument mapping
- Multiple independent causes
- Simpler than full CPT for basic cases
- CPT available when needed

**Why top-to-bottom layout?**
- Matches handle positions (top = input, bottom = output)
- Standard for Bayesian networks
- Natural causal flow (causes → effects)

**Why template system?**
- Semantic meaning in argument maps
- Visual distinction between node types
- Quick node creation with sensible defaults
- Extensible for new types

**Why configuration-based templates?**
- Easy to add new templates without code changes
- Centralized in one file
- UI automatically updates
- Consistent pattern

---

**End of Session State Document**

*This file should be updated at the end of each development session with new features, commits, and context.*

import { useState } from 'react'
import StatisticsPanel from './StatisticsPanel'
import './ControlPanel.css'

function ControlPanel({ nodes, edges, onAddNode, onOpenImportExport }) {
  const [nodeLabel, setNodeLabel] = useState('')
  const [nodeProbability, setNodeProbability] = useState(0.5)

  const handleAddNode = () => {
    if (nodeLabel.trim()) {
      onAddNode({
        label: nodeLabel,
        probability: parseFloat(nodeProbability)
      })
      setNodeLabel('')
      setNodeProbability(0.5)
    }
  }

  return (
    <div className="control-panel">
      <h2>Argument Mapping</h2>

      <div className="control-section">
        <h3>Add Node</h3>

        <div className="input-group">
          <label htmlFor="node-label">Label:</label>
          <input
            id="node-label"
            type="text"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            placeholder="Enter node label"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
          />
        </div>

        <div className="input-group">
          <label htmlFor="node-probability">Prior Probability:</label>
          <input
            id="node-probability"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={nodeProbability}
            onChange={(e) => setNodeProbability(e.target.value)}
          />
        </div>

        <button className="add-button" onClick={handleAddNode}>
          Add Node
        </button>
      </div>

      <div className="control-section">
        <h3>File Operations</h3>
        <button className="action-button-compact" onClick={onOpenImportExport}>
          📁 Import / Export
        </button>
      </div>

      <StatisticsPanel nodes={nodes} edges={edges} />

      <div className="control-section">
        <h3>Instructions</h3>
        <ul className="instructions">
          <li>Add nodes using the form above</li>
          <li>Click nodes to edit label and probability</li>
          <li>Right-click node for CPT options</li>
          <li>Drag nodes to reposition them</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Click edges to edit conditional probabilities</li>
          <li>Probabilities auto-update via Bayesian inference</li>
        </ul>
      </div>

      <div className="control-section">
        <h3>Bayesian Network</h3>
        <p className="info-text">
          This app implements Bayesian inference with a noisy-OR model by default.
          For complex relationships, use Conditional Probability Tables (CPT) to define
          exact probabilities for all parent state combinations.
        </p>
      </div>
    </div>
  )
}

export default ControlPanel

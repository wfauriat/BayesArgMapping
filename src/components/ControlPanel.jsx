import { useState } from 'react'
import './ControlPanel.css'

function ControlPanel({ onAddNode }) {
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
        <h3>Instructions</h3>
        <ul className="instructions">
          <li>Add nodes using the form above</li>
          <li>Click nodes to edit label and probability</li>
          <li>Drag nodes to reposition them</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Click edges to edit conditional probabilities</li>
          <li>Probabilities auto-update via Bayesian inference</li>
        </ul>
      </div>

      <div className="control-section">
        <h3>Bayesian Network</h3>
        <p className="info-text">
          This app implements Bayesian inference with a noisy-OR model.
          When you connect nodes or change probabilities, the network automatically
          propagates updates to dependent nodes using conditional probabilities.
        </p>
      </div>
    </div>
  )
}

export default ControlPanel

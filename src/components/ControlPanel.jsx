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
          <li>Drag nodes to reposition them</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Click edges to edit probabilities</li>
        </ul>
      </div>
    </div>
  )
}

export default ControlPanel

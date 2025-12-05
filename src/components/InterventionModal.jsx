import { useState, useEffect } from 'react'
import './InterventionModal.css'

/**
 * Intervention Modal - Implements Pearl's do-operator
 * Allows setting a node to a fixed value (intervention)
 * Different from observation - breaks incoming causal links
 */
function InterventionModal({ node, onApplyIntervention, onClearIntervention, onClose }) {
  const [interventionValue, setInterventionValue] = useState(0.5)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (node?.data?.intervention) {
      setIsActive(true)
      setInterventionValue(node.data.intervention.value)
    } else {
      setIsActive(false)
      setInterventionValue(node?.data?.probability ?? 0.5)
    }
  }, [node])

  const handleApply = () => {
    onApplyIntervention(node.id, parseFloat(interventionValue))
    onClose()
  }

  const handleClear = () => {
    onClearIntervention(node.id)
    onClose()
  }

  if (!node) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content intervention-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Causal Intervention (do-operator)</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="intervention-info">
            <strong>Node:</strong> {node.data?.label || 'Unnamed'}
            <br />
            {isActive && (
              <span className="active-intervention">
                ⚠️ Active Intervention: {(node.data.intervention.value * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="intervention-explanation">
            <h4>What is a Causal Intervention?</h4>
            <p>
              <strong>do-operator (Pearl):</strong> Forces this node to a specific value,
              breaking all incoming causal links. Effects propagate only to descendants.
            </p>
            <ul>
              <li><strong>Observation:</strong> "What if we <em>see</em> this node is true?"</li>
              <li><strong>Intervention:</strong> "What if we <em>make</em> this node true?"</li>
            </ul>
            <p className="note">
              Intervention answers: "What would happen if we actively set this variable?"
            </p>
          </div>

          <div className="intervention-controls">
            <h4>Set Intervention Value</h4>

            <div className="input-group">
              <label htmlFor="intervention-value">Force Probability To:</label>
              <input
                id="intervention-value"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={interventionValue}
                onChange={(e) => setInterventionValue(e.target.value)}
              />
              <div className="probability-display">
                {(interventionValue * 100).toFixed(0)}%
              </div>
            </div>

            <div className="probability-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={interventionValue}
                onChange={(e) => setInterventionValue(e.target.value)}
              />
            </div>
          </div>

          <div className="intervention-warning">
            <strong>Effect:</strong> This will:
            <ul>
              <li>Set {node.data?.label} to {(interventionValue * 100).toFixed(0)}%</li>
              <li>Ignore all parent influences</li>
              <li>Propagate effects to all descendants</li>
              <li>Show intervention marker on node</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <div className="left-buttons">
            {isActive && (
              <button className="clear-button" onClick={handleClear}>
                Clear Intervention
              </button>
            )}
          </div>
          <div className="button-group">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="apply-button" onClick={handleApply}>
              Apply Intervention (do)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterventionModal

import { useState, useEffect } from 'react'
import './CPTModal.css'

/**
 * CPT (Conditional Probability Table) Modal
 * Allows defining probability values for all combinations of parent states
 */
function CPTModal({ node, parentNodes, edges, onSave, onClose }) {
  const [cptData, setCptData] = useState({})

  useEffect(() => {
    // Initialize CPT with existing data or defaults
    if (node.data?.cpt) {
      setCptData(node.data.cpt)
    } else {
      // Generate default CPT structure
      const defaultCPT = generateDefaultCPT(parentNodes)
      setCptData(defaultCPT)
    }
  }, [node, parentNodes])

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        cpt: cptData,
        useCPT: true
      }
    }
    onSave(updatedNode)
    onClose()
  }

  const handleProbabilityChange = (key, value) => {
    setCptData({
      ...cptData,
      [key]: parseFloat(value)
    })
  }

  const handleUseSimpleModel = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        useCPT: false,
        cpt: null
      }
    }
    onSave(updatedNode)
    onClose()
  }

  if (!parentNodes || parentNodes.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content cpt-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Conditional Probability Table</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p className="info-message">
              This node has no parents. CPT is only applicable to nodes with parent dependencies.
              Use the simple probability value instead.
            </p>
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cpt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Conditional Probability Table</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="cpt-info">
            <strong>Node:</strong> {node.data?.label || 'Unnamed'}
            <br />
            <strong>Parents:</strong> {parentNodes.map(p => p.data?.label).join(', ')}
          </div>

          <div className="cpt-description">
            Define probability of this node being true for each combination of parent states.
            Binary states: False (0) or True (1)
          </div>

          <div className="cpt-table-container">
            <table className="cpt-table">
              <thead>
                <tr>
                  {parentNodes.map((parent, idx) => (
                    <th key={idx}>{parent.data?.label || `Parent ${idx + 1}`}</th>
                  ))}
                  <th>P({node.data?.label} = True)</th>
                </tr>
              </thead>
              <tbody>
                {generateCPTRows(parentNodes).map((row, idx) => {
                  const key = row.join(',')
                  return (
                    <tr key={idx}>
                      {row.map((state, cellIdx) => (
                        <td key={cellIdx} className="state-cell">
                          {state ? 'True' : 'False'}
                        </td>
                      ))}
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={cptData[key] || 0.5}
                          onChange={(e) => handleProbabilityChange(key, e.target.value)}
                          className="cpt-input"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="simple-button" onClick={handleUseSimpleModel}>
            Use Simple Model
          </button>
          <div className="button-group">
            <button className="cancel-button" onClick={onClose}>Cancel</button>
            <button className="save-button" onClick={handleSave}>Save CPT</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate all possible combinations of parent states
function generateCPTRows(parents) {
  const numParents = parents.length
  const numRows = Math.pow(2, numParents)
  const rows = []

  for (let i = 0; i < numRows; i++) {
    const row = []
    for (let j = 0; j < numParents; j++) {
      // Convert number to binary representation
      const state = (i >> (numParents - 1 - j)) & 1
      row.push(state === 1)
    }
    rows.push(row)
  }

  return rows
}

// Generate default CPT with 0.5 probability for all combinations
function generateDefaultCPT(parents) {
  const rows = generateCPTRows(parents)
  const cpt = {}

  rows.forEach(row => {
    const key = row.join(',')
    cpt[key] = 0.5
  })

  return cpt
}

export default CPTModal

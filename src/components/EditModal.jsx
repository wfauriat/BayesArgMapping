import { useState, useEffect } from 'react'
import { getAvailableEdgeTypes, getAvailableTemplates, getNodeTemplate } from '../utils/nodeTemplates'
import './EditModal.css'

function EditModal({ type, item, onSave, onClose, onDelete, onOpenCPT, onOpenIntervention }) {
  const [label, setLabel] = useState('')
  const [probability, setProbability] = useState(0.5)
  const [nodeTemplate, setNodeTemplate] = useState('default')
  const [edgeLabel, setEdgeLabel] = useState('')
  const [edgeType, setEdgeType] = useState('influences')

  useEffect(() => {
    if (type === 'node' && item) {
      setLabel(item.data?.label || '')
      setProbability(item.data?.probability || 0.5)
      setNodeTemplate(item.data?.template || 'default')
    } else if (type === 'edge' && item) {
      setProbability(item.data?.probability || 0.5)
      setEdgeLabel(item.data?.edgeLabel || '')
      setEdgeType(item.data?.edgeType || 'influences')
    }
  }, [type, item])

  const handleTemplateChange = (templateKey) => {
    setNodeTemplate(templateKey)
    const template = getNodeTemplate(templateKey)
    setProbability(template.probability)
  }

  const handleSave = () => {
    if (type === 'node') {
      const template = getNodeTemplate(nodeTemplate)
      onSave({
        ...item,
        data: {
          ...item.data,
          label: label.trim() || 'Unnamed Node',
          probability: parseFloat(probability),
          template: nodeTemplate,
          color: template.color,
          backgroundColor: template.backgroundColor,
          icon: template.icon
        }
      })
    } else if (type === 'edge') {
      onSave({
        ...item,
        data: {
          ...item.data,
          probability: parseFloat(probability),
          edgeLabel: edgeLabel.trim(),
          edgeType: edgeType
        }
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      onDelete(item.id)
      onClose()
    }
  }

  if (!item) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {type === 'node' ? 'Node' : 'Edge'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {type === 'node' && (
            <>
              <div className="input-group">
                <label htmlFor="node-template">Node Type:</label>
                <select
                  id="node-template"
                  value={nodeTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="template-select"
                >
                  {getAvailableTemplates().map(template => (
                    <option key={template.key} value={template.key}>
                      {template.icon} {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="edit-label">Label:</label>
                <input
                  id="edit-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter node label"
                  autoFocus
                />
              </div>
            </>
          )}

          {type === 'edge' && (
            <>
              <div className="input-group">
                <label htmlFor="edge-type">Relationship Type:</label>
                <select
                  id="edge-type"
                  value={edgeType}
                  onChange={(e) => setEdgeType(e.target.value)}
                  className="template-select"
                >
                  {getAvailableEdgeTypes().map(type => (
                    <option key={type.key} value={type.key}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="edge-label">Label (optional):</label>
                <input
                  id="edge-label"
                  type="text"
                  value={edgeLabel}
                  onChange={(e) => setEdgeLabel(e.target.value)}
                  placeholder="Enter relationship label"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="edit-probability">
              {type === 'node' ? 'Prior Probability:' : 'Conditional Probability:'}
            </label>
            <input
              id="edit-probability"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
            />
            <div className="probability-display">
              {(probability * 100).toFixed(0)}%
            </div>
          </div>

          <div className="probability-slider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="left-buttons">
            <button className="delete-button" onClick={handleDelete}>
              Delete {type === 'node' ? 'Node' : 'Edge'}
            </button>
            {type === 'node' && onOpenCPT && (
              <button className="cpt-button" onClick={() => { onClose(); onOpenCPT(item); }}>
                Edit CPT
              </button>
            )}
            {type === 'node' && onOpenIntervention && (
              <button className="intervention-button" onClick={() => { onClose(); onOpenIntervention(item); }}>
                do( ) Intervention
              </button>
            )}
          </div>
          <div className="button-group">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditModal

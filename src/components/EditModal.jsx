import { useState, useEffect } from 'react'
import './EditModal.css'

function EditModal({ type, item, onSave, onClose, onDelete }) {
  const [label, setLabel] = useState('')
  const [probability, setProbability] = useState(0.5)

  useEffect(() => {
    if (type === 'node' && item) {
      setLabel(item.data?.label || '')
      setProbability(item.data?.probability || 0.5)
    } else if (type === 'edge' && item) {
      setProbability(item.data?.probability || 0.5)
    }
  }, [type, item])

  const handleSave = () => {
    if (type === 'node') {
      onSave({
        ...item,
        data: {
          ...item.data,
          label: label.trim() || 'Unnamed Node',
          probability: parseFloat(probability)
        }
      })
    } else if (type === 'edge') {
      onSave({
        ...item,
        data: {
          ...item.data,
          probability: parseFloat(probability)
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
          <button className="delete-button" onClick={handleDelete}>
            Delete {type === 'node' ? 'Node' : 'Edge'}
          </button>
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

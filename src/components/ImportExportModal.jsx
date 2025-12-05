import { useState, useRef } from 'react'
import {
  exportToJSON,
  importFromJSON,
  downloadJSON,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToPNG
} from '../utils/exportImport'
import './ImportExportModal.css'

function ImportExportModal({ nodes, edges, onImport, onClose }) {
  const [activeTab, setActiveTab] = useState('export')
  const [importText, setImportText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleExportJSON = () => {
    try {
      const json = exportToJSON(nodes, edges)
      downloadJSON(json)
      setSuccess('Network exported successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`Export failed: ${err.message}`)
    }
  }

  const handleSaveLocal = () => {
    try {
      const timestamp = new Date().toISOString()
      const key = `bayesian-network-${timestamp}`
      saveToLocalStorage(nodes, edges, key)
      setSuccess('Network saved to browser storage!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`Save failed: ${err.message}`)
    }
  }

  const handleLoadLocal = () => {
    try {
      const data = loadFromLocalStorage()
      if (data) {
        onImport(data.nodes, data.edges)
        setSuccess('Network loaded from browser storage!')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 1500)
      } else {
        setError('No saved network found in browser storage')
      }
    } catch (err) {
      setError(`Load failed: ${err.message}`)
    }
  }

  const handleImportText = () => {
    try {
      setError('')
      const data = importFromJSON(importText)
      onImport(data.nodes, data.edges)
      setSuccess('Network imported successfully!')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 1500)
    } catch (err) {
      setError(`Import failed: ${err.message}`)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        setError('')
        const data = importFromJSON(e.target?.result)
        onImport(data.nodes, data.edges)
        setSuccess('File imported successfully!')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 1500)
      } catch (err) {
        setError(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  const handleExportPNG = () => {
    try {
      exportToPNG()
      setSuccess('Exporting to PNG...')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`PNG export failed: ${err.message}`)
    }
  }

  const handleCopyJSON = () => {
    try {
      const json = exportToJSON(nodes, edges)
      navigator.clipboard.writeText(json)
      setSuccess('JSON copied to clipboard!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`Copy failed: ${err.message}`)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Import / Export Network</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
          <button
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Import
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}

          {activeTab === 'export' && (
            <div className="tab-content">
              <h4>Export Options</h4>

              <div className="button-list">
                <button className="action-button" onClick={handleExportJSON}>
                  <span className="button-icon">📥</span>
                  Download as JSON File
                </button>

                <button className="action-button" onClick={handleCopyJSON}>
                  <span className="button-icon">📋</span>
                  Copy JSON to Clipboard
                </button>

                <button className="action-button" onClick={handleSaveLocal}>
                  <span className="button-icon">💾</span>
                  Save to Browser Storage
                </button>

                <button className="action-button" onClick={handleExportPNG}>
                  <span className="button-icon">🖼️</span>
                  Export as PNG Image
                </button>
              </div>

              <div className="info-box">
                <strong>Export Formats:</strong>
                <ul>
                  <li><strong>JSON:</strong> Save network structure and data</li>
                  <li><strong>Browser Storage:</strong> Quick save for later sessions</li>
                  <li><strong>PNG:</strong> Visual export of the network (requires html2canvas)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="tab-content">
              <h4>Import Options</h4>

              <div className="button-list">
                <button className="action-button" onClick={handleLoadLocal}>
                  <span className="button-icon">📂</span>
                  Load from Browser Storage
                </button>

                <button className="action-button" onClick={() => fileInputRef.current?.click()}>
                  <span className="button-icon">📁</span>
                  Upload JSON File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              <div className="import-text-section">
                <h4>Or Paste JSON:</h4>
                <textarea
                  className="import-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste JSON network data here..."
                  rows={8}
                />
                <button
                  className="action-button primary"
                  onClick={handleImportText}
                  disabled={!importText.trim()}
                >
                  Import from Text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportExportModal

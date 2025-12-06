import { useState } from 'react'
import StatisticsPanel from './StatisticsPanel'
import { getAvailableTemplates, getNodeTemplate } from '../utils/nodeTemplates'
import './ControlPanel.css'

function ControlPanel({
  nodes,
  edges,
  onAddNode,
  onOpenImportExport,
  onAutoLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedNodes,
  onBulkDelete,
  onBulkUpdateProbability,
  onBulkUpdateTemplate
}) {
  const [nodeLabel, setNodeLabel] = useState('')
  const [nodeProbability, setNodeProbability] = useState(0.5)
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [bulkProbability, setBulkProbability] = useState(0.5)
  const [bulkTemplate, setBulkTemplate] = useState('default')

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    const template = getNodeTemplate(templateKey)
    setNodeProbability(template.probability)
  }

  const handleAddNode = () => {
    if (nodeLabel.trim()) {
      const template = getNodeTemplate(selectedTemplate)
      onAddNode({
        label: nodeLabel,
        probability: parseFloat(nodeProbability),
        template: selectedTemplate,
        color: template.color,
        backgroundColor: template.backgroundColor,
        icon: template.icon
      })
      setNodeLabel('')
      setNodeProbability(0.5)
      setSelectedTemplate('default')
    }
  }

  const handleBulkTemplateChange = (templateKey) => {
    setBulkTemplate(templateKey)
    const template = getNodeTemplate(templateKey)
    setBulkProbability(template.probability)
  }

  const handleApplyBulkTemplate = () => {
    const template = getNodeTemplate(bulkTemplate)
    onBulkUpdateTemplate(bulkTemplate, template.color, template.backgroundColor, template.icon)
  }

  return (
    <div className="control-panel">
      <h2>Argument Mapping</h2>

      <div className="control-section">
        <h3>Add Node</h3>

        <div className="input-group">
          <label htmlFor="node-template">Node Type:</label>
          <select
            id="node-template"
            value={selectedTemplate}
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
        <h3>Graph Operations</h3>
        <div className="button-row">
          <button
            className="action-button-compact"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="action-button-compact"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>
        <button className="action-button-compact" onClick={onOpenImportExport}>
          📁 Import / Export
        </button>
        <button className="action-button-compact" onClick={onAutoLayout}>
          🔄 Auto-Layout
        </button>
      </div>

      {selectedNodes.length > 0 && (
        <div className="control-section bulk-operations">
          <h3>Bulk Operations ({selectedNodes.length} selected)</h3>

          <div className="input-group">
            <label>Template:</label>
            <select
              value={bulkTemplate}
              onChange={(e) => handleBulkTemplateChange(e.target.value)}
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
            <label>Probability:</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={bulkProbability}
              onChange={(e) => setBulkProbability(parseFloat(e.target.value))}
            />
          </div>

          <div className="button-row">
            <button
              className="action-button-compact"
              onClick={handleApplyBulkTemplate}
            >
              Apply Template
            </button>
            <button
              className="action-button-compact"
              onClick={() => onBulkUpdateProbability(bulkProbability)}
            >
              Set Probability
            </button>
          </div>

          <button
            className="action-button-compact delete-button"
            onClick={onBulkDelete}
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      <StatisticsPanel nodes={nodes} edges={edges} />

      <div className="control-section">
        <h3>Instructions</h3>
        <ul className="instructions">
          <li>Add nodes using the form above</li>
          <li>Click nodes to edit label and probability</li>
          <li>Shift+click to multi-select nodes</li>
          <li>Drag nodes to reposition them</li>
          <li>Connect nodes by dragging from handles</li>
          <li>Click edges to edit conditional probabilities</li>
          <li>Use Auto-Layout to organize nodes in layers</li>
          <li>Ctrl+Z to undo, Ctrl+Y to redo</li>
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

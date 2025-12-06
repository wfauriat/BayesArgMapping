import { useState, useEffect } from 'react';
import {
  calculateConditionalProbability,
  findMostProbableExplanation,
  getQueryableNodes
} from '../utils/probabilityQueries';
import './ProbabilityQueryModal.css';

function ProbabilityQueryModal({ nodes, edges, onClose }) {
  const [queryMode, setQueryMode] = useState('conditional'); // 'conditional' or 'mpe'
  const [queryNodeId, setQueryNodeId] = useState('');
  const [evidence, setEvidence] = useState({});
  const [result, setResult] = useState(null);

  const queryableNodes = getQueryableNodes(nodes);

  useEffect(() => {
    // Auto-select first node if none selected
    if (!queryNodeId && queryableNodes.length > 0) {
      setQueryNodeId(queryableNodes[0].id);
    }
  }, [queryNodeId, queryableNodes]);

  const handleEvidenceChange = (nodeId, state) => {
    setEvidence(prev => {
      const updated = { ...prev };
      if (state === 'unset') {
        delete updated[nodeId];
      } else if (state === 'true') {
        updated[nodeId] = 0.99; // High probability for "true"
      } else if (state === 'false') {
        updated[nodeId] = 0.01; // Low probability for "false"
      }
      return updated;
    });
  };

  const getEvidenceState = (nodeId) => {
    const value = evidence[nodeId];
    if (value === undefined) return 'unset';
    if (value > 0.5) return 'true';
    return 'false';
  };

  const handleRunQuery = () => {
    if (queryMode === 'conditional') {
      const queryNode = nodes.find(n => n.id === queryNodeId);
      if (!queryNode) return;

      const queryResult = calculateConditionalProbability(nodes, edges, queryNode, evidence);
      setResult(queryResult);
    } else {
      // MPE mode
      const mpeResult = findMostProbableExplanation(nodes, edges, evidence);
      setResult(mpeResult);
    }
  };

  const handleClearEvidence = () => {
    setEvidence({});
    setResult(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container query-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 Probability Query</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Query Mode Selection */}
          <div className="query-mode-selector">
            <button
              className={`mode-button ${queryMode === 'conditional' ? 'active' : ''}`}
              onClick={() => { setQueryMode('conditional'); setResult(null); }}
            >
              📊 Conditional Query
            </button>
            <button
              className={`mode-button ${queryMode === 'mpe' ? 'active' : ''}`}
              onClick={() => { setQueryMode('mpe'); setResult(null); }}
            >
              🎯 Most Probable Explanation
            </button>
          </div>

          {/* Query Type Description */}
          <div className="query-description">
            {queryMode === 'conditional' ? (
              <p>
                Calculate <strong>P(query | evidence)</strong> - the probability of a target node
                given observed evidence. This answers "what if" questions about specific outcomes.
              </p>
            ) : (
              <p>
                Find the <strong>Most Probable Explanation (MPE)</strong> - the most likely
                assignment of all unobserved variables given the evidence. This finds the best
                explanation for what you've observed.
              </p>
            )}
          </div>

          {/* Conditional Query: Select Query Node */}
          {queryMode === 'conditional' && (
            <div className="query-section">
              <label className="query-label">Query Node (what to predict):</label>
              <select
                value={queryNodeId}
                onChange={(e) => { setQueryNodeId(e.target.value); setResult(null); }}
                className="query-select"
              >
                {queryableNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.data.icon} {node.data.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Evidence Selection */}
          <div className="query-section">
            <label className="query-label">
              Evidence (observed values):
              <button className="clear-button" onClick={handleClearEvidence}>Clear All</button>
            </label>

            <div className="evidence-list">
              {queryableNodes
                .filter(n => queryMode === 'mpe' || n.id !== queryNodeId)
                .map(node => {
                  const state = getEvidenceState(node.id);
                  return (
                    <div key={node.id} className="evidence-item">
                      <label className="evidence-label">
                        {node.data.icon} {node.data.label}:
                      </label>
                      <div className="evidence-buttons">
                        <button
                          className={`evidence-btn ${state === 'true' ? 'active-true' : ''}`}
                          onClick={() => handleEvidenceChange(node.id, 'true')}
                        >
                          ✓ True
                        </button>
                        <button
                          className={`evidence-btn ${state === 'false' ? 'active-false' : ''}`}
                          onClick={() => handleEvidenceChange(node.id, 'false')}
                        >
                          ✗ False
                        </button>
                        <button
                          className={`evidence-btn ${state === 'unset' ? 'active-unset' : ''}`}
                          onClick={() => handleEvidenceChange(node.id, 'unset')}
                        >
                          ? Unknown
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Run Query Button */}
          <button
            className="run-query-button"
            onClick={handleRunQuery}
            disabled={queryMode === 'conditional' && !queryNodeId}
          >
            {queryMode === 'conditional' ? '🔍 Calculate Probability' : '🎯 Find MPE'}
          </button>

          {/* Results */}
          {result && (
            <div className="query-results">
              <h3 className="results-title">Results</h3>

              {queryMode === 'conditional' && result.queryNode && (
                <div className="result-summary">
                  <div className="result-main">
                    <span className="result-label">P({result.queryNode.label} | evidence) = </span>
                    <span className="result-probability">
                      {(result.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {queryMode === 'mpe' && result.assignment && (
                <div className="mpe-results">
                  <h4>Most Probable Assignment:</h4>
                  <div className="mpe-assignments">
                    {Object.entries(result.assignment).map(([nodeId, value]) => {
                      const node = nodes.find(n => n.id === nodeId);
                      if (!node) return null;
                      return (
                        <div key={nodeId} className="mpe-item">
                          <span className="mpe-node-label">
                            {node.data.icon} {node.data.label}:
                          </span>
                          <span className="mpe-probability">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reasoning Chain */}
              {result.reasoning && result.reasoning.length > 0 && (
                <div className="reasoning-section">
                  <h4>Reasoning Chain:</h4>
                  <div className="reasoning-list">
                    {result.reasoning.map((step, idx) => (
                      <div
                        key={idx}
                        className={`reasoning-step reasoning-${step.type}`}
                      >
                        {step.type === 'evidence' && '📌 '}
                        {step.type === 'calculation' && '🔢 '}
                        {step.type === 'parent' && '└─ '}
                        {step.type === 'method' && '⚙️ '}
                        {step.type === 'result' && '✅ '}
                        {step.type === 'info' && 'ℹ️ '}
                        {step.type === 'assignment' && '→ '}
                        {step.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ProbabilityQueryModal;

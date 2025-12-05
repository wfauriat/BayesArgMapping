import { Handle, Position } from 'reactflow'
import './BayesianNode.css'

function BayesianNode({ data }) {
  const hasIntervention = data?.intervention?.active

  return (
    <div className={`bayesian-node ${hasIntervention ? 'intervention-active' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle"
      />

      <div className="node-content">
        {hasIntervention && (
          <div className="intervention-badge">do({data.label})</div>
        )}
        <div className="node-label">{data.label}</div>
        <div className="node-probability">
          {hasIntervention && <span className="do-operator">do: </span>}
          P = {(data.probability * 100).toFixed(0)}%
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle"
      />
    </div>
  )
}

export default BayesianNode

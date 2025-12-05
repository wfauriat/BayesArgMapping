import { Handle, Position } from 'reactflow'
import './BayesianNode.css'

function BayesianNode({ data }) {
  return (
    <div className="bayesian-node">
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle"
      />

      <div className="node-content">
        <div className="node-label">{data.label}</div>
        <div className="node-probability">
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

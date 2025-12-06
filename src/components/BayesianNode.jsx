import { Handle, Position } from 'reactflow'
import './BayesianNode.css'

function BayesianNode({ data, selected }) {
  const hasIntervention = data?.intervention?.active
  const nodeStyle = {}

  // Apply template colors if available
  if (data?.color) {
    nodeStyle.borderColor = data.color
  }
  if (data?.backgroundColor) {
    nodeStyle.background = `linear-gradient(135deg, ${data.backgroundColor} 0%, ${adjustBrightness(data.backgroundColor, 10)} 100%)`
  }

  // Build class names
  const classNames = ['bayesian-node']
  if (hasIntervention) classNames.push('intervention-active')
  if (selected) classNames.push('selected')

  return (
    <div
      className={classNames.join(' ')}
      style={nodeStyle}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle"
        style={data?.color ? { backgroundColor: data.color } : {}}
      />

      <div className="node-content">
        {hasIntervention && (
          <div className="intervention-badge">do({data.label})</div>
        )}
        {data?.icon && <div className="node-icon">{data.icon}</div>}
        <div className="node-label">{data.label}</div>
        <div
          className="node-probability"
          style={data?.color ? { color: data.color, borderColor: data.color } : {}}
        >
          {hasIntervention && <span className="do-operator">do: </span>}
          P = {(data.probability * 100).toFixed(0)}%
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle"
        style={data?.color ? { backgroundColor: data.color } : {}}
      />
    </div>
  )
}

// Helper function to adjust brightness
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`
}

export default BayesianNode

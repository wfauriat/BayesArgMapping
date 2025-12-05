import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow'
import { getEdgeType } from '../utils/nodeTemplates'
import './ConditionalEdge.css'

function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const probability = data?.probability ?? 0.5
  const edgeLabel = data?.edgeLabel || ''
  const edgeTypeKey = data?.edgeType || 'influences'
  const edgeTypeConfig = getEdgeType(edgeTypeKey)

  // Apply edge type styling
  const edgeStyle = {
    ...style,
    stroke: edgeTypeConfig.color,
    strokeWidth: selected ? 3 : 2,
  }

  // Apply dash pattern for non-solid styles
  if (edgeTypeConfig.style === 'dashed') {
    edgeStyle.strokeDasharray = '10,5'
  } else if (edgeTypeConfig.style === 'dotted') {
    edgeStyle.strokeDasharray = '2,4'
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`edge-label ${selected ? 'selected' : ''}`}
        >
          {edgeLabel && (
            <div
              className="edge-type-label"
              style={{ color: edgeTypeConfig.color }}
            >
              {edgeLabel}
            </div>
          )}
          <div className="edge-probability">
            P = {(probability * 100).toFixed(0)}%
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default ConditionalEdge

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow'
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

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`edge-label ${selected ? 'selected' : ''}`}
        >
          <div className="edge-probability">
            P = {(probability * 100).toFixed(0)}%
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default ConditionalEdge

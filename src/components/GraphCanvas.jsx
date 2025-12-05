import { useCallback } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import BayesianNode from './BayesianNode'
import './GraphCanvas.css'

const nodeTypes = {
  bayesianNode: BayesianNode,
}

function GraphCanvas({ nodes, edges, setNodes, setEdges }) {
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges)

  // Sync external nodes to local state
  if (nodes.length !== localNodes.length) {
    setLocalNodes(nodes)
  }

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        data: { probability: 0.5 }
      }
      setLocalEdges((eds) => addEdge(newEdge, eds))
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setLocalEdges, setEdges]
  )

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes)
      setNodes((nds) => {
        const updatedNodes = [...nds]
        changes.forEach((change) => {
          if (change.type === 'position' && change.dragging === false) {
            const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id)
            if (nodeIndex !== -1 && change.position) {
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                position: change.position
              }
            }
          }
        })
        return updatedNodes
      })
    },
    [onNodesChange, setNodes]
  )

  return (
    <div className="graph-canvas">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return '#646cff'
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default GraphCanvas

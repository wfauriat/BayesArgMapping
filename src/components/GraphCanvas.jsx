import { useCallback, useState, useEffect } from 'react'
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
import ConditionalEdge from './ConditionalEdge'
import EditModal from './EditModal'
import CPTModal from './CPTModal'
import { propagateProbabilities, buildDependencyGraph } from '../utils/bayesianInference'
import './GraphCanvas.css'

const nodeTypes = {
  bayesianNode: BayesianNode,
}

const edgeTypes = {
  conditional: ConditionalEdge,
}

function GraphCanvas({ nodes, edges, setNodes, setEdges }) {
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState([])
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState([])
  const [editModal, setEditModal] = useState({ open: false, type: null, item: null })
  const [cptModal, setCptModal] = useState({ open: false, node: null })

  // Sync external nodes to local state only when externally added (not from internal updates)
  useEffect(() => {
    if (nodes.length !== localNodes.length) {
      setLocalNodes(nodes)
    }
  }, [nodes, localNodes.length, setLocalNodes])

  useEffect(() => {
    if (edges.length !== localEdges.length) {
      setLocalEdges(edges)
    }
  }, [edges, localEdges.length, setLocalEdges])

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'conditional',
        animated: true,
        data: { probability: 0.5 }
      }
      const updatedEdges = addEdge(newEdge, localEdges)
      setLocalEdges(updatedEdges)
      setEdges(updatedEdges)

      // Propagate probabilities through the network
      const updatedNodes = propagateProbabilities(localNodes, updatedEdges)
      setLocalNodes(updatedNodes)
      setNodes(updatedNodes)
    },
    [localEdges, localNodes, setLocalEdges, setEdges, setLocalNodes, setNodes]
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

  const handleNodeClick = useCallback((event, node) => {
    setEditModal({ open: true, type: 'node', item: node })
  }, [])

  const handleEdgeClick = useCallback((event, edge) => {
    setEditModal({ open: true, type: 'edge', item: edge })
  }, [])

  const handleSaveNode = useCallback((updatedNode) => {
    const updatedNodes = localNodes.map(n =>
      n.id === updatedNode.id ? updatedNode : n
    )

    // Propagate probability changes through the network
    const propagatedNodes = propagateProbabilities(updatedNodes, localEdges, updatedNode.id)

    setLocalNodes(propagatedNodes)
    setNodes(propagatedNodes)
  }, [localNodes, localEdges, setLocalNodes, setNodes])

  const handleSaveEdge = useCallback((updatedEdge) => {
    const updatedEdges = localEdges.map(e =>
      e.id === updatedEdge.id ? updatedEdge : e
    )
    setLocalEdges(updatedEdges)
    setEdges(updatedEdges)

    // Propagate probability changes through the network
    const propagatedNodes = propagateProbabilities(localNodes, updatedEdges)
    setLocalNodes(propagatedNodes)
    setNodes(propagatedNodes)
  }, [localEdges, localNodes, setLocalEdges, setEdges, setLocalNodes, setNodes])

  const handleDeleteNode = useCallback((nodeId) => {
    const updatedNodes = localNodes.filter(n => n.id !== nodeId)
    const updatedEdges = localEdges.filter(e => e.source !== nodeId && e.target !== nodeId)

    setLocalNodes(updatedNodes)
    setNodes(updatedNodes)
    setLocalEdges(updatedEdges)
    setEdges(updatedEdges)
  }, [localNodes, localEdges, setLocalNodes, setNodes, setLocalEdges, setEdges])

  const handleDeleteEdge = useCallback((edgeId) => {
    const updatedEdges = localEdges.filter(e => e.id !== edgeId)
    setLocalEdges(updatedEdges)
    setEdges(updatedEdges)

    // Recalculate probabilities after edge removal
    const propagatedNodes = propagateProbabilities(localNodes, updatedEdges)
    setLocalNodes(propagatedNodes)
    setNodes(propagatedNodes)
  }, [localEdges, localNodes, setLocalEdges, setEdges, setLocalNodes, setNodes])

  return (
    <div className="graph-canvas">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const prob = node.data?.probability ?? 0.5
            // Color based on probability: red (low) to green (high)
            const hue = prob * 120 // 0 = red, 120 = green
            return `hsl(${hue}, 70%, 50%)`
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {editModal.open && (
        <EditModal
          type={editModal.type}
          item={editModal.item}
          onSave={editModal.type === 'node' ? handleSaveNode : handleSaveEdge}
          onClose={() => setEditModal({ open: false, type: null, item: null })}
          onDelete={editModal.type === 'node' ? handleDeleteNode : handleDeleteEdge}
          onOpenCPT={(node) => setCptModal({ open: true, node })}
        />
      )}

      {cptModal.open && cptModal.node && (
        <CPTModal
          node={cptModal.node}
          parentNodes={getParentNodes(cptModal.node)}
          edges={localEdges}
          onSave={handleSaveNode}
          onClose={() => setCptModal({ open: false, node: null })}
        />
      )}
    </div>
  )

  function getParentNodes(node) {
    const graph = buildDependencyGraph(localNodes, localEdges)
    const parentIds = graph[node.id]?.parents || []
    return parentIds.map(id => localNodes.find(n => n.id === id)).filter(Boolean)
  }
}

export default GraphCanvas

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
import InterventionModal from './InterventionModal'
import { propagateProbabilities, buildDependencyGraph, applyIntervention } from '../utils/bayesianInference'
import './GraphCanvas.css'

const nodeTypes = {
  bayesianNode: BayesianNode,
}

const edgeTypes = {
  conditional: ConditionalEdge,
}

function GraphCanvas({ nodes, edges, setNodes, setEdges, layoutVersion, undoRedoVersion, selectedNodes, setSelectedNodes }) {
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState([])
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState([])
  const [editModal, setEditModal] = useState({ open: false, type: null, item: null })
  const [cptModal, setCptModal] = useState({ open: false, node: null })
  const [interventionModal, setInterventionModal] = useState({ open: false, node: null })

  // Sync external nodes to local state only when nodes are added/removed
  useEffect(() => {
    if (nodes.length !== localNodes.length) {
      setLocalNodes(nodes)
    }
  }, [nodes, localNodes.length, setLocalNodes])

  // Update nodes with selection state for visual feedback
  useEffect(() => {
    setLocalNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: selectedNodes.includes(node.id),
      }))
    )
  }, [selectedNodes, setLocalNodes])

  // Sync when auto-layout is triggered (layoutVersion changes)
  useEffect(() => {
    if (layoutVersion > 0) {
      setLocalNodes(nodes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutVersion])

  // Sync when undo/redo is triggered (undoRedoVersion changes)
  useEffect(() => {
    if (undoRedoVersion > 0) {
      setLocalNodes(nodes)
      setLocalEdges(edges)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoRedoVersion])

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
        data: {
          probability: 0.5,
          edgeType: 'influences',
          edgeLabel: ''
        }
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
    // Multi-select with Shift key
    if (event.shiftKey) {
      setSelectedNodes((prev) => {
        if (prev.includes(node.id)) {
          // Deselect if already selected
          return prev.filter((id) => id !== node.id)
        } else {
          // Add to selection
          return [...prev, node.id]
        }
      })
    } else {
      // Regular click - open edit modal (only if not multi-selecting)
      setEditModal({ open: true, type: 'node', item: node })
    }
  }, [setSelectedNodes])

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

  const handleApplyIntervention = useCallback((nodeId, interventionValue) => {
    // Apply do-operator: set node to fixed value and propagate to descendants only
    const updatedNodes = applyIntervention(localNodes, localEdges, nodeId, interventionValue)

    // Mark node as having intervention
    const nodesWithIntervention = updatedNodes.map(n =>
      n.id === nodeId
        ? {
            ...n,
            data: {
              ...n.data,
              intervention: { active: true, value: interventionValue }
            }
          }
        : n
    )

    setLocalNodes(nodesWithIntervention)
    setNodes(nodesWithIntervention)
  }, [localNodes, localEdges, setLocalNodes, setNodes])

  const handleClearIntervention = useCallback((nodeId) => {
    // Remove intervention and recalculate normally
    const updatedNodes = localNodes.map(n =>
      n.id === nodeId
        ? {
            ...n,
            data: {
              ...n.data,
              intervention: null
            }
          }
        : n
    )

    // Recalculate probabilities normally
    const propagatedNodes = propagateProbabilities(updatedNodes, localEdges)
    setLocalNodes(propagatedNodes)
    setNodes(propagatedNodes)
  }, [localNodes, localEdges, setLocalNodes, setNodes])

  // Handle clicking on empty canvas - deselect all
  const handlePaneClick = useCallback(() => {
    setSelectedNodes([])
  }, [setSelectedNodes])

  // Keyboard shortcuts for selection operations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key to delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.length > 0) {
        e.preventDefault()
        const updatedNodes = localNodes.filter(n => !selectedNodes.includes(n.id))
        const updatedEdges = localEdges.filter(e =>
          !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
        )
        setLocalNodes(updatedNodes)
        setNodes(updatedNodes)
        setLocalEdges(updatedEdges)
        setEdges(updatedEdges)
        setSelectedNodes([])
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedNodes([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, localNodes, localEdges, setLocalNodes, setNodes, setLocalEdges, setEdges, setSelectedNodes])

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
        onPaneClick={handlePaneClick}
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
          onOpenIntervention={(node) => setInterventionModal({ open: true, node })}
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

      {interventionModal.open && interventionModal.node && (
        <InterventionModal
          node={interventionModal.node}
          onApplyIntervention={handleApplyIntervention}
          onClearIntervention={handleClearIntervention}
          onClose={() => setInterventionModal({ open: false, node: null })}
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

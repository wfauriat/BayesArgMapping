import { useState, useEffect, useCallback, useRef } from 'react'
import ControlPanel from './components/ControlPanel'
import GraphCanvas from './components/GraphCanvas'
import ImportExportModal from './components/ImportExportModal'
import ProbabilityQueryModal from './components/ProbabilityQueryModal'
import { applyLayout } from './utils/layoutAlgorithms'
import { propagateProbabilities } from './utils/bayesianInference'
import { useHistory } from './hooks/useHistory'
import './App.css'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [showImportExport, setShowImportExport] = useState(false)
  const [showProbabilityQuery, setShowProbabilityQuery] = useState(false)
  const [layoutVersion, setLayoutVersion] = useState(0)
  const [undoRedoVersion, setUndoRedoVersion] = useState(0)
  const [selectedNodes, setSelectedNodes] = useState([])

  // Initialize history hook
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistory(nodes, edges)

  // Use ref to track if we should skip history addition
  const skipHistoryRef = useRef(false)
  const historyTimeoutRef = useRef(null)

  useEffect(() => {
    // Skip adding to history if this was an undo/redo action
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false
      return
    }

    // Clear existing timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current)
    }

    // Set new timeout to add to history after 300ms of no changes
    historyTimeoutRef.current = setTimeout(() => {
      addToHistory(nodes, edges)
    }, 300)

    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUndo = useCallback(() => {
    const prevState = undo()
    if (prevState) {
      skipHistoryRef.current = true
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setUndoRedoVersion(v => v + 1)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState) {
      skipHistoryRef.current = true
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setUndoRedoVersion(v => v + 1)
    }
  }, [redo])

  const addNode = (nodeData) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'bayesianNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeData.label || 'New Node',
        probability: nodeData.probability || 0.5,
        template: nodeData.template,
        color: nodeData.color,
        backgroundColor: nodeData.backgroundColor,
        icon: nodeData.icon
      }
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleImport = (importedNodes, importedEdges) => {
    // Recompute all child node probabilities to ensure consistency
    const nodesWithUpdatedProbabilities = propagateProbabilities(importedNodes, importedEdges)
    setNodes(nodesWithUpdatedProbabilities)
    setEdges(importedEdges)
  }

  const handleAutoLayout = () => {
    // Apply simple layered layout algorithm
    const layoutedNodes = applyLayout('simple', nodes, edges)
    // Also recompute child node probabilities for consistency
    const nodesWithUpdatedProbabilities = propagateProbabilities(layoutedNodes, edges)
    setNodes(nodesWithUpdatedProbabilities)
    setLayoutVersion(v => v + 1) // Trigger re-sync in GraphCanvas
  }

  // Bulk delete selected nodes
  const handleBulkDelete = useCallback(() => {
    if (selectedNodes.length === 0) return

    // Remove selected nodes and their connected edges
    setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)))
    setEdges((eds) => eds.filter((e) =>
      !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    ))
    setSelectedNodes([])
  }, [selectedNodes])

  // Bulk update probability for selected nodes
  const handleBulkUpdateProbability = useCallback((probability) => {
    if (selectedNodes.length === 0) return

    setNodes((nds) =>
      nds.map((n) =>
        selectedNodes.includes(n.id)
          ? { ...n, data: { ...n.data, probability } }
          : n
      )
    )
    // Force GraphCanvas to sync
    setUndoRedoVersion(v => v + 1)
  }, [selectedNodes])

  // Bulk update template for selected nodes
  const handleBulkUpdateTemplate = useCallback((template, color, backgroundColor, icon) => {
    if (selectedNodes.length === 0) return

    setNodes((nds) =>
      nds.map((n) =>
        selectedNodes.includes(n.id)
          ? { ...n, data: { ...n.data, template, color, backgroundColor, icon } }
          : n
      )
    )
    // Force GraphCanvas to sync
    setUndoRedoVersion(v => v + 1)
  }, [selectedNodes])

  return (
    <div className="app-container">
      <ControlPanel
        nodes={nodes}
        edges={edges}
        onAddNode={addNode}
        onOpenImportExport={() => setShowImportExport(true)}
        onOpenProbabilityQuery={() => setShowProbabilityQuery(true)}
        onAutoLayout={handleAutoLayout}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        selectedNodes={selectedNodes}
        onBulkDelete={handleBulkDelete}
        onBulkUpdateProbability={handleBulkUpdateProbability}
        onBulkUpdateTemplate={handleBulkUpdateTemplate}
      />
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        layoutVersion={layoutVersion}
        undoRedoVersion={undoRedoVersion}
        selectedNodes={selectedNodes}
        setSelectedNodes={setSelectedNodes}
      />

      {showImportExport && (
        <ImportExportModal
          nodes={nodes}
          edges={edges}
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {showProbabilityQuery && (
        <ProbabilityQueryModal
          nodes={nodes}
          edges={edges}
          onClose={() => setShowProbabilityQuery(false)}
        />
      )}
    </div>
  )
}

export default App

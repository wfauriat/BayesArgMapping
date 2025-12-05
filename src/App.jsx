import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import GraphCanvas from './components/GraphCanvas'
import ImportExportModal from './components/ImportExportModal'
import { applyLayout } from './utils/layoutAlgorithms'
import './App.css'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [showImportExport, setShowImportExport] = useState(false)
  const [layoutVersion, setLayoutVersion] = useState(0)

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
    setNodes(importedNodes)
    setEdges(importedEdges)
  }

  const handleAutoLayout = () => {
    // Apply simple layered layout algorithm
    const layoutedNodes = applyLayout('simple', nodes, edges)
    setNodes(layoutedNodes)
    setLayoutVersion(v => v + 1) // Trigger re-sync in GraphCanvas
  }

  return (
    <div className="app-container">
      <ControlPanel
        nodes={nodes}
        edges={edges}
        onAddNode={addNode}
        onOpenImportExport={() => setShowImportExport(true)}
        onAutoLayout={handleAutoLayout}
      />
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        layoutVersion={layoutVersion}
      />

      {showImportExport && (
        <ImportExportModal
          nodes={nodes}
          edges={edges}
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </div>
  )
}

export default App

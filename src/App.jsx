import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import GraphCanvas from './components/GraphCanvas'
import ImportExportModal from './components/ImportExportModal'
import './App.css'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [showImportExport, setShowImportExport] = useState(false)

  const addNode = (nodeData) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'bayesianNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeData.label || 'New Node',
        probability: nodeData.probability || 0.5
      }
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleImport = (importedNodes, importedEdges) => {
    setNodes(importedNodes)
    setEdges(importedEdges)
  }

  return (
    <div className="app-container">
      <ControlPanel
        nodes={nodes}
        edges={edges}
        onAddNode={addNode}
        onOpenImportExport={() => setShowImportExport(true)}
      />
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
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

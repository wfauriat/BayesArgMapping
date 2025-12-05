import { useState } from 'react'
import ControlPanel from './components/ControlPanel'
import GraphCanvas from './components/GraphCanvas'
import './App.css'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

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

  return (
    <div className="app-container">
      <ControlPanel onAddNode={addNode} />
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  )
}

export default App

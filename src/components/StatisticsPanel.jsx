import { useMemo } from 'react'
import { buildDependencyGraph } from '../utils/bayesianInference'
import './StatisticsPanel.css'

function StatisticsPanel({ nodes, edges }) {
  const stats = useMemo(() => {
    if (!nodes.length) {
      return {
        nodeCount: 0,
        edgeCount: 0,
        avgProbability: 0,
        rootNodes: 0,
        leafNodes: 0,
        avgDegree: 0,
        maxDepth: 0
      }
    }

    const graph = buildDependencyGraph(nodes, edges)

    // Count root nodes (no parents) and leaf nodes (no children)
    let rootNodes = 0
    let leafNodes = 0
    let totalInDegree = 0
    let totalOutDegree = 0

    Object.keys(graph).forEach(nodeId => {
      const { parents, children } = graph[nodeId]
      if (parents.length === 0) rootNodes++
      if (children.length === 0) leafNodes++
      totalInDegree += parents.length
      totalOutDegree += children.length
    })

    // Calculate average probability
    const totalProb = nodes.reduce((sum, node) => sum + (node.data?.probability || 0), 0)
    const avgProbability = nodes.length > 0 ? totalProb / nodes.length : 0

    // Calculate average degree
    const avgDegree = nodes.length > 0 ? (totalInDegree + totalOutDegree) / (2 * nodes.length) : 0

    // Calculate max depth (longest path from root)
    const maxDepth = calculateMaxDepth(nodes, graph)

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      avgProbability,
      rootNodes,
      leafNodes,
      avgDegree,
      maxDepth
    }
  }, [nodes, edges])

  return (
    <div className="statistics-panel">
      <h3>Network Statistics</h3>

      <div className="stat-grid">
        <div className="stat-item">
          <div className="stat-label">Nodes</div>
          <div className="stat-value">{stats.nodeCount}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Edges</div>
          <div className="stat-value">{stats.edgeCount}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Avg Probability</div>
          <div className="stat-value">{(stats.avgProbability * 100).toFixed(1)}%</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Root Nodes</div>
          <div className="stat-value">{stats.rootNodes}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Leaf Nodes</div>
          <div className="stat-value">{stats.leafNodes}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Avg Degree</div>
          <div className="stat-value">{stats.avgDegree.toFixed(1)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Max Depth</div>
          <div className="stat-value">{stats.maxDepth}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Density</div>
          <div className="stat-value">
            {stats.nodeCount > 1
              ? ((stats.edgeCount / (stats.nodeCount * (stats.nodeCount - 1))) * 100).toFixed(1) + '%'
              : '0%'}
          </div>
        </div>
      </div>

      {stats.nodeCount === 0 && (
        <div className="empty-state">
          Add nodes to see statistics
        </div>
      )}
    </div>
  )
}

// Helper function to calculate maximum depth
function calculateMaxDepth(nodes, graph) {
  if (nodes.length === 0) return 0

  const depths = {}
  const visited = new Set()

  function getDepth(nodeId) {
    if (depths[nodeId] !== undefined) return depths[nodeId]
    if (visited.has(nodeId)) return 0 // Cycle detection

    visited.add(nodeId)
    const parents = graph[nodeId]?.parents || []

    if (parents.length === 0) {
      depths[nodeId] = 0
    } else {
      const parentDepths = parents.map(parentId => getDepth(parentId))
      depths[nodeId] = Math.max(...parentDepths) + 1
    }

    visited.delete(nodeId)
    return depths[nodeId]
  }

  nodes.forEach(node => getDepth(node.id))
  return Math.max(...Object.values(depths))
}

export default StatisticsPanel

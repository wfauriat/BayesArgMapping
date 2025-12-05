/**
 * Export and Import Utilities for Bayesian Network
 */

/**
 * Export the current network to JSON format
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @returns {string} - JSON string representation
 */
export function exportToJSON(nodes, edges) {
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: edge.data
    }))
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Import network from JSON format
 * @param {string} jsonString - JSON string representation
 * @returns {Object} - { nodes, edges } object
 */
export function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString)

    if (!data.nodes || !data.edges) {
      throw new Error('Invalid format: missing nodes or edges')
    }

    return {
      nodes: data.nodes,
      edges: data.edges
    }
  } catch (error) {
    throw new Error(`Failed to import: ${error.message}`)
  }
}

/**
 * Download JSON file
 * @param {string} jsonString - JSON content
 * @param {string} filename - Desired filename
 */
export function downloadJSON(jsonString, filename = 'bayesian-network.json') {
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Save network to localStorage
 * @param {Array} nodes - Array of nodes
 * @param {Array} edges - Array of edges
 * @param {string} key - Storage key
 */
export function saveToLocalStorage(nodes, edges, key = 'bayesian-network') {
  const data = { nodes, edges }
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Load network from localStorage
 * @param {string} key - Storage key
 * @returns {Object|null} - { nodes, edges } object or null if not found
 */
export function loadFromLocalStorage(key = 'bayesian-network') {
  const data = localStorage.getItem(key)
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to parse localStorage data:', error)
    return null
  }
}

/**
 * Export canvas to PNG image
 * Note: PNG export requires html2canvas library
 * Install with: npm install html2canvas
 *
 * @param {string} selector - CSS selector for the React Flow container
 * @param {string} filename - Desired filename
 */
export async function exportToPNG(selector = '.react-flow', filename = 'bayesian-network.png') {
  // For now, show a message that PNG export is available but requires additional setup
  // Users can install html2canvas if they need this feature
  alert(
    'PNG Export Feature\n\n' +
    'To enable PNG export, install html2canvas:\n' +
    'npm install html2canvas\n\n' +
    'Then restart the development server.\n\n' +
    'Alternatively, use JSON export to save your network.'
  )

  // Note: Actual implementation would be:
  // 1. Install html2canvas: npm install html2canvas
  // 2. Import it at the top: import html2canvas from 'html2canvas'
  // 3. Use: const canvas = await html2canvas(element, options)
  // 4. Convert to blob and download
}

/**
 * Export to SVG (using React Flow's built-in functionality)
 * Note: This requires additional React Flow utilities
 */
export function exportToSVG() {
  // This would use React Flow's getViewport and transform utilities
  // For now, we'll use a simpler approach with the toSvg function
  console.log('SVG export: Use React Flow Panel component for built-in SVG export')
}

/**
 * Get list of saved networks from localStorage
 * @returns {Array} - Array of saved network keys with timestamps
 */
export function getSavedNetworks() {
  const saved = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('bayesian-network')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        saved.push({
          key,
          timestamp: data.timestamp || 'Unknown',
          nodeCount: data.nodes?.length || 0,
          edgeCount: data.edges?.length || 0
        })
      } catch (e) {
        // Skip invalid entries
      }
    }
  }
  return saved
}

/**
 * Delete saved network from localStorage
 * @param {string} key - Storage key
 */
export function deleteSavedNetwork(key) {
  localStorage.removeItem(key)
}

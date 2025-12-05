/**
 * Node Templates for Argument Mapping
 *
 * Predefined node types with colors, default probabilities, and semantic meaning
 * for building argument maps and Bayesian networks.
 */

export const nodeTemplates = {
  default: {
    name: 'Default Node',
    description: 'Standard Bayesian network node',
    color: '#646cff',
    backgroundColor: '#1a1a1a',
    probability: 0.5,
    icon: '●'
  },
  evidence: {
    name: 'Evidence',
    description: 'Observable facts or data',
    color: '#4ade80',
    backgroundColor: '#1a2e1a',
    probability: 0.8,
    icon: '📊'
  },
  hypothesis: {
    name: 'Hypothesis',
    description: 'Proposed explanation or theory',
    color: '#fbbf24',
    backgroundColor: '#2e2a1a',
    probability: 0.5,
    icon: '💡'
  },
  conclusion: {
    name: 'Conclusion',
    description: 'Final inference or decision',
    color: '#f87171',
    backgroundColor: '#2e1a1a',
    probability: 0.3,
    icon: '🎯'
  },
  assumption: {
    name: 'Assumption',
    description: 'Background belief or premise',
    color: '#a78bfa',
    backgroundColor: '#221a2e',
    probability: 0.7,
    icon: '🔮'
  },
  counterargument: {
    name: 'Counter-Argument',
    description: 'Opposing view or objection',
    color: '#fb923c',
    backgroundColor: '#2e221a',
    probability: 0.4,
    icon: '⚔️'
  }
}

/**
 * Edge relationship types for argument mapping
 */
export const edgeTypes = {
  supports: {
    name: 'Supports',
    description: 'Provides evidence for or strengthens',
    color: '#4ade80',
    style: 'solid',
    animated: true
  },
  contradicts: {
    name: 'Contradicts',
    description: 'Opposes or weakens',
    color: '#f87171',
    style: 'solid',
    animated: false
  },
  requires: {
    name: 'Requires',
    description: 'Necessary prerequisite',
    color: '#fbbf24',
    style: 'dashed',
    animated: false
  },
  influences: {
    name: 'Influences',
    description: 'Has causal effect on',
    color: '#60a5fa',
    style: 'solid',
    animated: true
  },
  correlates: {
    name: 'Correlates With',
    description: 'Associated but not causal',
    color: '#a78bfa',
    style: 'dotted',
    animated: false
  }
}

/**
 * Get template configuration by key
 */
export function getNodeTemplate(templateKey) {
  return nodeTemplates[templateKey] || nodeTemplates.default
}

/**
 * Get edge type configuration by key
 */
export function getEdgeType(typeKey) {
  return edgeTypes[typeKey] || edgeTypes.influences
}

/**
 * Get all available node templates as array
 */
export function getAvailableTemplates() {
  return Object.entries(nodeTemplates).map(([key, template]) => ({
    key,
    ...template
  }))
}

/**
 * Get all available edge types as array
 */
export function getAvailableEdgeTypes() {
  return Object.entries(edgeTypes).map(([key, type]) => ({
    key,
    ...type
  }))
}

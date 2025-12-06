import { useRef, useCallback } from 'react';

/**
 * Custom hook for undo/redo functionality
 * Manages a history stack of graph states (nodes and edges)
 */
export function useHistory(initialNodes = [], initialEdges = []) {
  const historyRef = useRef([{ nodes: initialNodes, edges: initialEdges }]);
  const currentIndexRef = useRef(0);

  // Add a new state to history
  const addToHistory = useCallback((nodes, edges) => {
    // Deep clone to avoid reference issues
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const edgesCopy = JSON.parse(JSON.stringify(edges));

    // Check if this state is identical to the current state (avoid duplicates)
    const currentState = historyRef.current[currentIndexRef.current];
    if (currentState &&
        JSON.stringify(currentState.nodes) === JSON.stringify(nodesCopy) &&
        JSON.stringify(currentState.edges) === JSON.stringify(edgesCopy)) {
      return;
    }

    // Remove any "future" states if we're not at the end
    const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
    // Add new state
    newHistory.push({ nodes: nodesCopy, edges: edgesCopy });

    // Limit history to 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
      historyRef.current = newHistory;
      currentIndexRef.current = 49;
    } else {
      historyRef.current = newHistory;
      currentIndexRef.current = newHistory.length - 1;
    }
  }, []);

  // Undo action
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      const state = historyRef.current[currentIndexRef.current];
      // Deep clone to avoid reference issues
      return {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges))
      };
    }
    return null;
  }, []);

  // Redo action
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const state = historyRef.current[currentIndexRef.current];
      // Deep clone to avoid reference issues
      return {
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges))
      };
    }
    return null;
  }, []);

  // Check if undo/redo are available
  const canUndo = useCallback(() => {
    return currentIndexRef.current > 0;
  }, []);

  const canRedo = useCallback(() => {
    return currentIndexRef.current < historyRef.current.length - 1;
  }, []);

  // Get current state
  const getCurrentState = useCallback(() => {
    return historyRef.current[currentIndexRef.current];
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    get historyLength() { return historyRef.current.length; },
    get currentIndex() { return currentIndexRef.current; }
  };
}

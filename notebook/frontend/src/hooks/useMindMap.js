import { useCallback, useReducer } from 'react';

const SPACING = { horizontal: 180, vertical: 100 };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_NODE': {
      const node = {
        id: `n-${Date.now()}`, label: action.payload.label ?? 'New Idea',
        shape: 'rounded', fillColor: '#FFD6E7', borderColor: '#FF69B4', textColor: '#2d1a24',
        x: action.payload.x ?? 300, y: action.payload.y ?? 200,
      };
      const edges = action.payload.parentId
        ? [...state.edges, { id: `e-${Date.now()}`, from: action.payload.parentId, to: node.id, label: '' }]
        : state.edges;
      return { ...state, nodes: [...state.nodes, node], edges };
    }
    case 'REMOVE_NODE': {
      const nodes = state.nodes.filter(n => n.id !== action.payload);
      const edges = state.edges.filter(e => e.from !== action.payload && e.to !== action.payload);
      return { ...state, nodes, edges };
    }
    case 'UPDATE_NODE': {
      const nodes = state.nodes.map(n => n.id === action.payload.id ? { ...n, ...action.payload.patch } : n);
      return { ...state, nodes };
    }
    case 'ADD_EDGE': {
      const edge = { id: `e-${Date.now()}`, from: action.payload.from, to: action.payload.to, label: '' };
      return { ...state, edges: [...state.edges, edge] };
    }
    case 'UPDATE_EDGE': {
      const edges = state.edges.map(e => e.id === action.payload.id ? { ...e, ...action.payload.patch } : e);
      return { ...state, edges };
    }
    case 'REMOVE_EDGE':
      return { ...state, edges: state.edges.filter(e => e.id !== action.payload) };
    case 'AUTO_LAYOUT_RADIAL': {
      if (!state.nodes.length) return state;
      const root = state.nodes[0];
      const radians = (2 * Math.PI) / Math.max(state.nodes.length - 1, 1);
      const RADIUS = 200;
      const nodes = state.nodes.map((n, i) => i === 0
        ? { ...n, x: 400, y: 300 }
        : { ...n, x: 400 + RADIUS * Math.cos(radians * (i - 1)), y: 300 + RADIUS * Math.sin(radians * (i - 1)) });
      return { ...state, nodes };
    }
    case 'AUTO_LAYOUT_HIERARCHICAL': {
      const { nodes } = state;
      if (!nodes.length) return state;
      const positioned = nodes.map((n, i) => ({
        ...n, x: 80 + (i % 5) * SPACING.horizontal, y: 80 + Math.floor(i / 5) * SPACING.vertical,
      }));
      return { ...state, nodes: positioned };
    }
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

export default function useMindMap(initial = { nodes: [], edges: [] }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const addNode    = useCallback((opts = {}) => dispatch({ type: 'ADD_NODE', payload: opts }), []);
  const removeNode = useCallback((id)        => dispatch({ type: 'REMOVE_NODE', payload: id }), []);
  const updateNode = useCallback((id, patch) => dispatch({ type: 'UPDATE_NODE', payload: { id, patch } }), []);
  const addEdge    = useCallback((from, to)  => dispatch({ type: 'ADD_EDGE', payload: { from, to } }), []);
  const updateEdge = useCallback((id, patch) => dispatch({ type: 'UPDATE_EDGE', payload: { id, patch } }), []);
  const removeEdge = useCallback((id)        => dispatch({ type: 'REMOVE_EDGE', payload: id }), []);
  const autoLayoutRadial       = useCallback(() => dispatch({ type: 'AUTO_LAYOUT_RADIAL' }), []);
  const autoLayoutHierarchical = useCallback(() => dispatch({ type: 'AUTO_LAYOUT_HIERARCHICAL' }), []);
  const hydrate    = useCallback((data)      => dispatch({ type: 'HYDRATE', payload: data }), []);

  return { ...state, addNode, removeNode, updateNode, addEdge, updateEdge, removeEdge, autoLayoutRadial, autoLayoutHierarchical, hydrate };
}

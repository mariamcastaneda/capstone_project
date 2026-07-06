import { useReducer, useCallback } from 'react';

const MAX_HISTORY = 100;

function reducer(state, action) {
  switch (action.type) {
    case 'PUSH': {
      const past = [...state.past.slice(-MAX_HISTORY + 1), state.present];
      return { past, present: action.payload, future: [] };
    }
    case 'UNDO': {
      if (!state.past.length) return state;
      const past    = state.past.slice(0, -1);
      const present = state.past[state.past.length - 1];
      const future  = [state.present, ...state.future];
      return { past, present, future };
    }
    case 'REDO': {
      if (!state.future.length) return state;
      const past    = [...state.past, state.present];
      const present = state.future[0];
      const future  = state.future.slice(1);
      return { past, present, future };
    }
    case 'CLEAR':
      return { past: [], present: action.payload, future: [] };
    default:
      return state;
  }
}

export default function useUndoRedo(initialState) {
  const [state, dispatch] = useReducer(reducer, {
    past: [], present: initialState, future: [],
  });

  const push    = useCallback(s => dispatch({ type: 'PUSH', payload: s }), []);
  const undo    = useCallback(()  => dispatch({ type: 'UNDO' }), []);
  const redo    = useCallback(()  => dispatch({ type: 'REDO' }), []);
  const clear   = useCallback(s  => dispatch({ type: 'CLEAR', payload: s ?? initialState }), [initialState]);

  return {
    state:    state.present,
    push, undo, redo, clear,
    canUndo:  state.past.length > 0,
    canRedo:  state.future.length > 0,
  };
}

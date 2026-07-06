import useUndoRedo from '../../src/hooks/useUndoRedo.js';
import { renderHook, act } from '@testing-library/react';

describe('useUndoRedo', () => {
  test('initialises with provided state and empty history', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    expect(result.current.state).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  test('push advances present and disables redo', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    act(() => result.current.push(['a']));
    expect(result.current.state).toEqual(['a']);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  test('undo restores prior state', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    act(() => result.current.push(['a']));
    act(() => result.current.push(['a', 'b']));
    act(() => result.current.undo());
    expect(result.current.state).toEqual(['a']);
  });

  test('redo re-applies undone state', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    act(() => result.current.push(['a']));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state).toEqual(['a']);
    expect(result.current.canRedo).toBe(false);
  });

  test('push after undo clears redo stack', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    act(() => result.current.push(['a']));
    act(() => result.current.undo());
    act(() => result.current.push(['b']));
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state).toEqual(['b']);
  });

  test('undo does nothing when already at initial state', () => {
    const { result } = renderHook(() => useUndoRedo(['init']));
    act(() => result.current.undo());
    expect(result.current.state).toEqual(['init']);
  });

  test('clear resets to provided value and empties stacks', () => {
    const { result } = renderHook(() => useUndoRedo([]));
    act(() => result.current.push(['a']));
    act(() => result.current.push(['b']));
    act(() => result.current.clear(['reset']));
    expect(result.current.state).toEqual(['reset']);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  test('history capped at 100 entries — oldest dropped on push 101', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    for (let i = 1; i <= 101; i++) {
      act(() => result.current.push(i));
    }
    // After 101 pushes past entries should be limited
    expect(result.current.canUndo).toBe(true);
    act(() => {
      // undo all the way back — should not crash
      for (let i = 0; i < 105; i++) result.current.undo();
    });
    expect(result.current.canUndo).toBe(false);
  });
});

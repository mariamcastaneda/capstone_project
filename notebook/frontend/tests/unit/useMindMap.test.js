import useMindMap from '../../src/hooks/useMindMap.js';
import { renderHook, act } from '@testing-library/react';

describe('useMindMap', () => {
  test('initialises with empty nodes and edges', () => {
    const { result } = renderHook(() => useMindMap());
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  test('addNode creates a node with a unique id', () => {
    const { result } = renderHook(() => useMindMap());
    act(() => result.current.addNode({ label: 'Root' }));
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toBeTruthy();
    expect(result.current.nodes[0].label).toBe('Root');
  });

  test('addNode with parentId creates an edge', () => {
    const { result } = renderHook(() => useMindMap());
    act(() => result.current.addNode({ label: 'Root' }));
    const parentId = result.current.nodes[0].id;
    act(() => result.current.addNode({ label: 'Child', parentId }));
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.edges[0].from).toBe(parentId);
  });

  test('removeNode also removes connected edges', () => {
    const { result } = renderHook(() => useMindMap());
    act(() => result.current.addNode({ label: 'A' }));
    const idA = result.current.nodes[0].id;
    act(() => result.current.addNode({ label: 'B', parentId: idA }));
    act(() => result.current.removeNode(idA));
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.edges).toHaveLength(0);
  });

  test('updateNode patches only specified fields', () => {
    const { result } = renderHook(() => useMindMap());
    act(() => result.current.addNode({ label: 'Old' }));
    const id = result.current.nodes[0].id;
    act(() => result.current.updateNode(id, { label: 'New', fillColor: '#fff' }));
    expect(result.current.nodes[0].label).toBe('New');
    expect(result.current.nodes[0].fillColor).toBe('#fff');
  });

  test('autoLayoutRadial repositions nodes without overlapping (x/y change)', () => {
    const { result } = renderHook(() => useMindMap());
    act(() => result.current.addNode({ label: 'C', x: 0, y: 0 }));
    act(() => result.current.addNode({ label: 'A', x: 0, y: 0 }));
    act(() => result.current.addNode({ label: 'B', x: 0, y: 0 }));
    act(() => result.current.autoLayoutRadial());
    const xs = result.current.nodes.map(n => n.x);
    // Not all x values should be identical after radial layout
    expect(new Set(xs).size).toBeGreaterThan(1);
  });

  test('autoLayoutHierarchical spreads nodes in a grid', () => {
    const { result } = renderHook(() => useMindMap());
    for (let i = 0; i < 6; i++) act(() => result.current.addNode({ label: `N${i}` }));
    act(() => result.current.autoLayoutHierarchical());
    const rows = new Set(result.current.nodes.map(n => n.y));
    expect(rows.size).toBeGreaterThan(1);
  });
});

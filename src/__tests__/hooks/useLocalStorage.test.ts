import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns a stored value if one exists', () => {
    localStorage.setItem('existing-key', JSON.stringify('stored value'));
    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
    expect(result.current[0]).toBe('stored value');
  });

  it('persists new values to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('persist-key', ''));
    act(() => {
      result.current[1]('new value');
    });
    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('persist-key')).toBe(JSON.stringify('new value'));
  });

  it('updates state on setValue call', () => {
    const { result } = renderHook(() => useLocalStorage('update-key', 0));
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
  });

  it('works with object values', () => {
    const initial = { a: 1, b: 'hello' };
    const { result } = renderHook(() => useLocalStorage('obj-key', initial));
    act(() => {
      result.current[1]({ a: 2, b: 'world' });
    });
    expect(result.current[0]).toEqual({ a: 2, b: 'world' });
  });

  it('works with array values', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []));
    act(() => {
      result.current[1](['a', 'b', 'c']);
    });
    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  it('returns initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('bad-json-key', 'not valid json {{{');
    const { result } = renderHook(() => useLocalStorage('bad-json-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    expect(JSON.parse(localStorage.getItem('bool-key')!)).toBe(true);
  });
});

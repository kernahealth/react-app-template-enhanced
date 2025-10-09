import { renderHook, act } from '@testing-library/react';
import { useExampleStore } from './exampleStore';

describe('exampleStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useExampleStore());
    act(() => {
      result.current.reset();
    });
  });

  it('initializes with count 0', () => {
    const { result } = renderHook(() => useExampleStore());
    expect(result.current.count).toBe(0);
  });

  it('increments the count', () => {
    const { result } = renderHook(() => useExampleStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements the count', () => {
    const { result } = renderHook(() => useExampleStore());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.decrement();
    });

    expect(result.current.count).toBe(1);
  });

  it('resets the count to 0', () => {
    const { result } = renderHook(() => useExampleStore());

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });

  it('persists the count across multiple renders', () => {
    const { result: result1 } = renderHook(() => useExampleStore());

    act(() => {
      result1.current.increment();
      result1.current.increment();
    });

    // Create a new hook instance to test persistence
    const { result: result2 } = renderHook(() => useExampleStore());

    expect(result2.current.count).toBe(2);
  });
});

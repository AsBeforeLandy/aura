import { describe, it, expect, vi } from 'vitest';
import { prefixCls, classNames, debounce, throttle, isEmpty } from './utils';

describe('prefixCls', () => {
  it('should return aura- prefixed class name', () => {
    expect(prefixCls('btn')).toBe('aura-btn');
    expect(prefixCls('btn-primary')).toBe('aura-btn-primary');
  });
});

describe('classNames', () => {
  it('should join truthy class names', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('should filter falsy values', () => {
    expect(classNames('a', null, undefined, false, '', 'b')).toBe('a b');
  });

  it('should handle empty input', () => {
    expect(classNames()).toBe('');
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('should limit function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('isEmpty', () => {
  it('should return true for null and undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string, array, and object', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });
});

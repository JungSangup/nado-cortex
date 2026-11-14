import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../src/core/RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter(30); // 30ms interval
  });

  afterEach(() => {
    rateLimiter.clear();
    vi.useRealTimers();
  });

  it('should execute the first call immediately (leading edge)', () => {
    const fn = vi.fn();
    rateLimiter.execute('key1', fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throttle intermediate calls and execute the latest call at trailing edge', () => {
    const results: number[] = [];

    // Rapidly execute 5 calls with values 1, 2, 3, 4, 5 within 10ms
    rateLimiter.execute('param1', () => results.push(1));
    expect(results).toEqual([1]); // First call executed immediately

    vi.advanceTimersByTime(5);
    rateLimiter.execute('param1', () => results.push(2));

    vi.advanceTimersByTime(5);
    rateLimiter.execute('param1', () => results.push(3));

    vi.advanceTimersByTime(5);
    rateLimiter.execute('param1', () => results.push(4));

    vi.advanceTimersByTime(5);
    rateLimiter.execute('param1', () => results.push(5)); // Final value

    // At 20ms, trailing timer has not fired yet
    expect(results).toEqual([1]);

    // Advance past the 30ms window
    vi.advanceTimersByTime(20);

    // Final value 5 should have been executed!
    expect(results).toEqual([1, 5]);
  });
});

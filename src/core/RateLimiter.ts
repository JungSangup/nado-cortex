/**
 * RateLimiter
 * 
 * Ensures high-frequency input streams (such as rotary encoder turning) do not saturate
 * Bluetooth LE bandwidth. Guarantees trailing-edge execution so the final dialed value
 * is always delivered to the hardware.
 */
export class RateLimiter {
  private intervalMs: number;
  private pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastExecutionTime = new Map<string, number>();

  constructor(intervalMs: number = 30) {
    this.intervalMs = intervalMs;
  }

  public setInterval(ms: number): void {
    this.intervalMs = ms;
  }

  /**
   * Schedules a task identified by key.
   * If called multiple times within intervalMs, throttles execution and guarantees
   * the latest task callback runs at the trailing edge.
   */
  public execute(key: string, task: () => void | Promise<void> | unknown): void {
    const now = Date.now();
    const lastRun = this.lastExecutionTime.get(key) || 0;
    const elapsed = now - lastRun;

    // Clear any existing pending trailing-edge timer
    if (this.pendingTimers.has(key)) {
      clearTimeout(this.pendingTimers.get(key)!);
      this.pendingTimers.delete(key);
    }

    if (elapsed >= this.intervalMs) {
      // Immediate execution (Leading edge)
      this.lastExecutionTime.set(key, now);
      task();
    } else {
      // Delay execution to trailing edge
      const delay = this.intervalMs - elapsed;
      const timer = setTimeout(() => {
        this.pendingTimers.delete(key);
        this.lastExecutionTime.set(key, Date.now());
        task();
      }, delay);
      this.pendingTimers.set(key, timer);
    }
  }

  /**
   * Cancels all pending timers.
   */
  public clear(): void {
    for (const timer of this.pendingTimers.values()) {
      clearTimeout(timer);
    }
    this.pendingTimers.clear();
    this.lastExecutionTime.clear();
  }
}

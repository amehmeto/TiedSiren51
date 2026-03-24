/**
 * Flushes one microtask tick so fire-and-forget async operations
 * (e.g., `void syncSchedule()`) settle before assertions run.
 */
export const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0))

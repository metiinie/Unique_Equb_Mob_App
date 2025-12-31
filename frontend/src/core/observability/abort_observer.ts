import { AbortEvent } from './abort_event';

/**
 * AbortObserver: One-way sink for abort evidence.
 * 
 * Rules:
 * - Fire-and-forget (no return value)
 * - No retry
 * - Failure to notify does NOT change system behavior
 * - Never throws (observability must not affect abort semantics)
 * 
 * This keeps:
 * - Abort semantics intact
 * - Observability non-invasive
 * 
 * This aligns with principle: "Errors propagate upward intact" and "Observability is evidence emission, not behavior change."
 */
export interface AbortObserver {
  /**
   * Notifies the observer of an abort event.
   * 
   * This method:
   * - Must never throw
   * - Must never block
   * - Must never affect abort behavior
   * - Must be fire-and-forget
   * 
   * If notification fails, it is silently ignored (observability failure does not affect system behavior).
   */
  notify(event: AbortEvent): void;
}

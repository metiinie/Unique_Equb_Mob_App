import { AbortEvent } from './abort_event';
import { AbortObserver } from './abort_observer';

/**
 * InMemoryAbortObserver: Stores abort events in memory for testing.
 * 
 * This observer:
 * - Stores events in a list
 * - Provides access for test assertions
 * - Never throws (observability failure does not affect system)
 * 
 * This is for testing only, not production use.
 */
export class InMemoryAbortObserver implements AbortObserver {
  private readonly _events: AbortEvent[] = [];

  notify(event: AbortEvent): void {
    try {
      this._events.push(event);
    } catch (e) {
      // Observability failure does not affect system behavior
      // Silently ignore (fire-and-forget)
    }
  }

  /** Gets all recorded abort events. */
  getEvents(): ReadonlyArray<AbortEvent> {
    return [...this._events];
  }

  /** Gets the count of recorded abort events. */
  get eventCount(): number {
    return this._events.length;
  }

  /** Clears all recorded events (for testing only). */
  clear(): void {
    while (this._events.length > 0) {
      this._events.pop();
    }
  }

  /** Gets the most recent abort event. */
  getLastEvent(): AbortEvent | null {
    return this._events.length === 0 ? null : this._events[this._events.length - 1];
  }
}

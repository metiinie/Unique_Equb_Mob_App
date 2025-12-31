import { AbortEvent } from './abort_event';
import { AbortObserver } from './abort_observer';

/**
 * ConsoleAbortObserver: Emits abort events to stdout/stderr.
 * 
 * For MVP, this is the primary observability mechanism.
 * 
 * Rules:
 * - Writes to stderr (aborts are errors)
 * - Never throws (observability failure does not affect system)
 * - Fire-and-forget
 * 
 * This aligns with principle: "Truth must be observable, or it's useless in production."
 */
export class ConsoleAbortObserver implements AbortObserver {
  notify(event: AbortEvent): void {
    try {
      // Write to stderr (aborts are errors)
      console.error(event.toHumanReadableString());
    } catch (e) {
      // Observability failure does not affect system behavior
      // Silently ignore (fire-and-forget)
    }
  }
}

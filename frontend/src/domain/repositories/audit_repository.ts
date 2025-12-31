import { AuditEvent } from '../entities/audit_event';
import { EqubId } from '../value_objects/ids';

/**
 * Repository for audit events.
 * 
 * This repository is append-only: events are immutable and never modified.
 * 
 * This aligns with principle: "Audit determinism" and "Trust > Convenience"
 */
export interface AuditRepository {
  /**
   * Appends an audit event (immutable, append-only).
   * 
   * Must never fail silently. If audit cannot be recorded, the operation must fail.
   * This guarantees: "If it happened, it is auditable."
   */
  appendEvent(event: AuditEvent): Promise<void>;

  /** Gets all audit events for an Equb, in chronological order. */
  getEvents(equbId: EqubId): Promise<AuditEvent[]>;

  /** Gets all audit events for an Equb, ordered by timestamp (newest first). */
  getEventsReversed(equbId: EqubId): Promise<AuditEvent[]>;

  /**
   * Performs a structured read-only query on audit events.
   * 
   * This is for inspection only (Phase 4).
   */
  queryEvents(criteria: {
    equbId?: EqubId;
    actorId?: string;
    commandId?: string;
    before?: Date;
    after?: Date;
  }): Promise<AuditEvent[]>;
}

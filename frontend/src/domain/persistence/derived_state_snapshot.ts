import { Contribution } from '../entities/contribution';
import { Equb } from '../entities/equb';
import { Payout } from '../entities/payout';
import { EqubId } from '../value_objects/ids';

/**
 * DerivedStateSnapshot: Read-only snapshot of Equb state derived from audit events.
 * 
 * This is a performance optimization only. The authoritative truth is the audit events.
 * 
 * Rules:
 * - Written only after successful command + audit
 * - Read-only for UI
 * - Can be discarded and rebuilt
 * - Loss of snapshot is acceptable (rebuild from audit)
 * 
 * This aligns with principle: "AuditEvents are the authoritative record"
 * 
 * No snapshot → no UI reads (rebuild from audit)
 * No audit → no snapshot (operation fails)
 */
export class DerivedStateSnapshot {
  public readonly equb: Equb;
  public readonly contributions: Contribution[];
  public readonly payouts: Payout[];
  public readonly snapshotTimestamp: Date;
  public readonly equbId: EqubId;

  constructor({
    equb,
    contributions,
    payouts,
    snapshotTimestamp,
    equbId,
  }: {
    equb: Equb;
    contributions: Contribution[];
    payouts: Payout[];
    snapshotTimestamp: Date;
    equbId: EqubId;
  }) {
    this.equb = equb;
    this.contributions = contributions;
    this.payouts = payouts;
    this.snapshotTimestamp = snapshotTimestamp;
    this.equbId = equbId;
  }

  /**
   * Creates a snapshot from current Equb state.
   * 
   * This is a convenience method for creating snapshots after successful operations.
   */
  static fromCurrentState({
    equb,
    contributions,
    payouts,
  }: {
    equb: Equb;
    contributions: Contribution[];
    payouts: Payout[];
  }): DerivedStateSnapshot {
    return new DerivedStateSnapshot({
      equb,
      contributions,
      payouts,
      snapshotTimestamp: new Date(),
      equbId: equb.id,
    });
  }

  /**
   * Checks if this snapshot is stale (older than given timestamp).
   * 
   * Used to determine if snapshot should be rebuilt from audit events.
   */
  isStale(lastAuditTimestamp: Date): boolean {
    return this.snapshotTimestamp.getTime() < lastAuditTimestamp.getTime();
  }
}

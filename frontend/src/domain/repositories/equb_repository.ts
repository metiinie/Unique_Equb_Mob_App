import { ContributionStatus, EqubStatus, EqubFrequency, PayoutStatus } from '../../core/constants/enums';
import { AdminSummary } from '../entities/admin_summary';
import { AuditLogEntry } from '../entities/audit_log_entry';
import { Contribution } from '../entities/contribution';
import { Equb } from '../entities/equb';
import { EqubMember } from '../entities/equb_member';
import { Payout } from '../entities/payout';
import { CommandEnvelope } from '../value_objects/command_envelope';
import { CommandId } from '../value_objects/command_id';
import { EqubId, UserId } from '../value_objects/ids';

export interface EqubRepository {
  getEqubsForAdmin(adminId: UserId): Promise<Equb[]>;

  getEqubsForCollector(collectorId: UserId): Promise<Equb[]>;

  getEqubsForMember(memberId: UserId): Promise<Equb[]>;

  getEqubById(id: EqubId): Promise<Equb>;

  createEqub(equb: Equb, commandId: CommandId): Promise<Equb>;

  updateEqubStatus({
    equbId,
    status,
    commandId,
    reason,
  }: {
    equbId: EqubId;
    status: EqubStatus;
    commandId: CommandId;
    reason?: string; // required when canceled
  }): Promise<void>;

  getContributions(equbId: EqubId): Promise<Contribution[]>;

  setContributionStatus({
    contributionId,
    status,
    commandId,
    actorId,
    reason,
  }: {
    contributionId: string;
    status: ContributionStatus;
    commandId: CommandId;
    actorId: UserId;
    reason?: string; // required when status is onHold
  }): Promise<void>;

  getPayouts(equbId: EqubId): Promise<Payout[]>;

  updatePayoutStatus({
    payoutId,
    status,
    commandId,
    actorId,
  }: {
    payoutId: string;
    status: PayoutStatus;
    commandId: CommandId;
    actorId: UserId;
  }): Promise<void>;

  getAuditLog(equbId: EqubId): Promise<AuditLogEntry[]>;
  getAdminSummary(adminId: UserId): Promise<AdminSummary>;

  updateEqubDetails({
    equbId,
    commandId,
    name,
    contributionAmount,
    frequency,
  }: {
    equbId: EqubId;
    commandId: CommandId;
    name?: string;
    contributionAmount?: number;
    frequency?: EqubFrequency;
  }): Promise<void>;

  updateMembers({
    equbId,
    commandId,
    members,
  }: {
    equbId: EqubId;
    commandId: CommandId;
    members: EqubMember[];
  }): Promise<Equb>;

  /**
   * Command tracking for idempotency and ordering enforcement.
   * 
   * These methods enforce:
   * - Idempotency: same commandId must not be applied twice
   * - Ordering: commands must be applied in issuedAt order per Equb
   * - Concurrency: single-writer rule (one Equb = one logical writer at a time)
   */

  /**
   * Checks if a command has already been processed.
   * 
   * Returns true if commandId was already processed, false otherwise.
   * Used to enforce idempotency: duplicate commands are rejected.
   */
  hasProcessedCommand(commandId: CommandId): Promise<boolean>;

  /**
   * Records that a command was processed.
   * 
   * This must be called AFTER successful state mutation and audit emission.
   * If this fails, the operation is considered failed (no state change without command tracking).
   */
  recordCommand(envelope: CommandEnvelope): Promise<void>;

  /**
   * Gets the timestamp of the last processed command for an Equb.
   * 
   * Returns null if no commands have been processed yet.
   * Used to enforce strict ordering: commands arriving "from the past" are rejected.
   */
  getLastCommandTimestamp(equbId: EqubId): Promise<Date | null>;
}

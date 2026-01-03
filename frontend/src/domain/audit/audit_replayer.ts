import { ContributionStatus, EqubStatus, PayoutStatus } from '../../core/constants/enums';
import { DomainError } from '../../core/errors/domain_errors';
import { AuditActionType, AuditEvent } from '../entities/audit_event';
import { Contribution } from '../entities/contribution';
import { Equb } from '../entities/equb';
import { Payout } from '../entities/payout';
import { MemberId } from '../value_objects/ids';
import { DerivedEqubState } from './derived_equb_state';

/**
 * Pure function that reconstructs Equb state from audit events.
 * 
 * This is a verifier, not the main state.
 * 
 * Rules:
 * - Pure function (no side effects, no dependencies)
 * - Deterministic (same events = same result)
 * - No timestamps used for logic (order only)
 * - Throws DomainError on impossible sequences
 * 
 * This aligns with principle: "State can be reconstructed from audit events"
 */
export class AuditReplayer {
  /**
   * Replays audit events to derive Equb state.
   * 
   * Events must be in chronological order (oldest first).
   * 
   * Returns DerivedEqubState representing what state SHOULD be.
   * Throws DomainError if sequence is invalid or impossible.
   */
  static replay({
    initialEqub,
    events,
  }: {
    initialEqub: Equb;
    events: AuditEvent[];
  }): DerivedEqubState {
    // Sort events by timestamp to ensure chronological order
    const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Start with initial state
    let currentEqub = initialEqub;
    const contributions = new Map<string, Contribution>();
    const payouts = new Map<string, Payout>();

    // Apply each event sequentially
    for (const event of sortedEvents) {
      switch (event.actionType) {
        case AuditActionType.contributionStatusChanged:
          AuditReplayer.applyContributionStatusChange(event, contributions, currentEqub);
          break;

        case AuditActionType.payoutStatusChanged:
          AuditReplayer.applyPayoutStatusChange(event, payouts, currentEqub);
          break;

        case AuditActionType.equbStatusChanged:
          currentEqub = AuditReplayer.applyEqubStatusChange(event, currentEqub);
          break;

        case AuditActionType.equbDetailsUpdated:
          // For MVP, we track status changes but not detail updates in replay
          // This is acceptable because details don't affect contributions/payouts
          break;

        case AuditActionType.membersUpdated:
          // For MVP, we track member count but not individual member changes
          // This is acceptable for drift detection of core state
          break;
      }
    }

    return new DerivedEqubState({
      equb: currentEqub,
      contributions,
      payouts,
    });
  }

  private static applyContributionStatusChange(
    event: AuditEvent,
    contributions: Map<string, Contribution>,
    _currentEqub: Equb
  ): void {
    if (!event.previousValue || !event.newValue) {
      throw new DomainError(
        `Invalid contribution status change event: missing previousValue or newValue. Event ID: ${event.id}`,
        { code: 'INVALID_AUDIT_EVENT' }
      );
    }

    // Parse statuses
    const previousStatus = AuditReplayer.parseContributionStatus(event.previousValue);
    const newStatus = AuditReplayer.parseContributionStatus(event.newValue);

    // Get or create contribution
    let existing = contributions.get(event.targetId);
    if (!existing) {
      // First time seeing this contribution - create it
      // We need to infer equbId and memberId from context
      // For MVP, we assume targetId is contributionId and use event.equbId
      existing = new Contribution({
        id: event.targetId,
        equbId: event.equbId,
        memberId: new MemberId('unknown'), // Will be inferred from actual data
        period: new Date(), // Will be inferred from actual data
        roundNumber: 1, // Will be inferred from actual data
        status: previousStatus,
        setBy: event.actorId,
        setAt: event.timestamp,
        reason: event.reason,
      });
    }

    // Verify previous status matches
    if (existing.status !== previousStatus) {
      throw new DomainError(
        `Contribution status mismatch in audit replay: Expected ${previousStatus}, found ${existing.status}. Event ID: ${event.id}, Contribution ID: ${event.targetId}`,
        { code: 'AUDIT_DRIFT_DETECTED' }
      );
    }

    // Update contribution
    contributions.set(event.targetId, new Contribution({
      id: existing.id,
      equbId: existing.equbId,
      memberId: existing.memberId,
      period: existing.period,
      roundNumber: existing.roundNumber,
      status: newStatus,
      setBy: event.actorId,
      setAt: event.timestamp,
      reason: event.reason,
    }));
  }

  private static applyPayoutStatusChange(
    event: AuditEvent,
    payouts: Map<string, Payout>,
    _currentEqub: Equb
  ): void {
    if (!event.previousValue || !event.newValue) {
      throw new DomainError(
        `Invalid payout status change event: missing previousValue or newValue. Event ID: ${event.id}`,
        { code: 'INVALID_AUDIT_EVENT' }
      );
    }

    // Parse statuses
    const previousStatus = AuditReplayer.parsePayoutStatus(event.previousValue);
    const newStatus = AuditReplayer.parsePayoutStatus(event.newValue);

    // Get or create payout
    let existing = payouts.get(event.targetId);
    if (!existing) {
      // First time seeing this payout - create it
      existing = new Payout({
        id: event.targetId,
        equbId: event.equbId,
        memberId: new MemberId('unknown'), // Will be inferred from actual data
        roundNumber: 1, // Will be inferred from actual data
        status: previousStatus,
        blockedReason: undefined,
      });
    }

    // Verify previous status matches
    if (existing.status !== previousStatus) {
      throw new DomainError(
        `Payout status mismatch in audit replay: Expected ${previousStatus}, found ${existing.status}. Event ID: ${event.id}, Payout ID: ${event.targetId}`,
        { code: 'AUDIT_DRIFT_DETECTED' }
      );
    }

    // Update payout
    payouts.set(event.targetId, new Payout({
      id: existing.id,
      equbId: existing.equbId,
      memberId: existing.memberId,
      roundNumber: existing.roundNumber,
      status: newStatus,
      blockedReason: existing.blockedReason,
    }));
  }

  private static applyEqubStatusChange(event: AuditEvent, currentEqub: Equb): Equb {
    if (!event.previousValue || !event.newValue) {
      throw new DomainError(
        `Invalid Equb status change event: missing previousValue or newValue. Event ID: ${event.id}`,
        { code: 'INVALID_AUDIT_EVENT' }
      );
    }

    // Parse statuses
    const previousStatus = AuditReplayer.parseEqubStatus(event.previousValue);
    const newStatus = AuditReplayer.parseEqubStatus(event.newValue);

    // Verify previous status matches
    if (currentEqub.status !== previousStatus) {
      throw new DomainError(
        `Equb status mismatch in audit replay: Expected ${previousStatus}, found ${currentEqub.status}. Event ID: ${event.id}`,
        { code: 'AUDIT_DRIFT_DETECTED' }
      );
    }

    // Update Equb
    return new Equb({
      id: currentEqub.id,
      name: currentEqub.name,
      contributionAmount: currentEqub.contributionAmount,
      frequency: currentEqub.frequency,
      startDate: currentEqub.startDate,
      status: newStatus,
      members: currentEqub.members,
      payoutOrder: currentEqub.payoutOrder,
      currentRoundNumber: currentEqub.currentRoundNumber,
      totalRounds: currentEqub.totalRounds,
    });
  }

  private static parseContributionStatus(value: string): ContributionStatus {
    switch (value.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return ContributionStatus.CONFIRMED;
      case 'unpaid':
      case 'pending':
        return ContributionStatus.PENDING;
      case 'rejected':
        return ContributionStatus.REJECTED;
      case 'onhold':
      case 'on_hold':
        return ContributionStatus.PENDING; // Fallback
      default:
        throw new DomainError(
          `Invalid contribution status in audit event: ${value}`,
          { code: 'INVALID_AUDIT_EVENT' }
        );
    }
  }

  private static parsePayoutStatus(value: string): PayoutStatus {
    switch (value.toLowerCase()) {
      case 'pending':
        return PayoutStatus.PENDING;
      case 'scheduled':
      case 'adminconfirmed':
        return PayoutStatus.SCHEDULED;
      case 'executed':
      case 'memberconfirmed':
        return PayoutStatus.EXECUTED;
      case 'completed':
        return PayoutStatus.COMPLETED;
      case 'rejected':
        return PayoutStatus.REJECTED;
      default:
        throw new DomainError(
          `Invalid payout status in audit event: ${value}`,
          { code: 'INVALID_AUDIT_EVENT' }
        );
    }
  }

  private static parseEqubStatus(value: string): EqubStatus {
    switch (value.toLowerCase()) {
      case 'draft':
        return EqubStatus.DRAFT;
      case 'planned':
      case 'active':
        return EqubStatus.ACTIVE;
      case 'onhold':
      case 'on_hold':
        return EqubStatus.ON_HOLD;
      case 'completed':
        return EqubStatus.COMPLETED;
      case 'canceled':
      case 'terminated':
        return EqubStatus.TERMINATED;
      default:
        throw new DomainError(
          `Invalid Equb status in audit event: ${value}`,
          { code: 'INVALID_AUDIT_EVENT' }
        );
    }
  }
}

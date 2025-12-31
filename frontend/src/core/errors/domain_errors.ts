import { FailureSeverity, AllowedReaction } from '../constants/enums';
export { FailureSeverity, AllowedReaction };

/**
 * Domain errors represent invariant violations in the Equb system.
 * These errors are human-readable and protect the social contract.
 * 
 * Every DomainError declares:
 * - severity: Category of failure
 * - recoverable: Whether automatic recovery is allowed (always false in Unique Equb)
 * - allowedReaction: What the system is allowed to do (always abortOnly)
 * 
 * This prevents future devs (or AI tools) from adding "retry", "fallback", or "silent correction".
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly principle?: string;
  public readonly severity: FailureSeverity;
  public readonly recoverable: boolean;
  public readonly allowedReaction: AllowedReaction;

  constructor(
    message: string,
    {
      code = 'DOMAIN_ERROR',
      principle,
      severity = FailureSeverity.invariantViolation,
      recoverable = false, // No automatic recovery in Unique Equb
      allowedReaction = AllowedReaction.abortOnly, // Always abort, never retry/fallback
    }: {
      code?: string;
      principle?: string;
      severity?: FailureSeverity;
      recoverable?: boolean;
      allowedReaction?: AllowedReaction;
    } = {}
  ) {
    super(message);
    this.code = code;
    this.principle = principle;
    this.severity = severity;
    this.recoverable = recoverable;
    this.allowedReaction = allowedReaction;

    // Correct prototype chain
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  toString(): string {
    return this.message;
  }
}

// Specific error types for clarity and testing

export class EqubLifecycleError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'EQUB_LIFECYCLE_ERROR',
      principle: 'Terminal states are read-only',
      severity: FailureSeverity.forbiddenAction,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, EqubLifecycleError.prototype);
  }
}

export class ContributionStatusError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'CONTRIBUTION_STATUS_ERROR',
      principle: 'Contributions must respect Equb lifecycle and require reason for On Hold',
      severity: FailureSeverity.invariantViolation,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, ContributionStatusError.prototype);
  }
}

export class PayoutLockError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'PAYOUT_LOCK_ERROR',
      principle: 'Payouts are locked when contributions are unresolved',
      severity: FailureSeverity.invariantViolation,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, PayoutLockError.prototype);
  }
}

export class RolePermissionError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'ROLE_PERMISSION_ERROR',
      principle: 'Role boundaries must never blur',
      severity: FailureSeverity.forbiddenAction,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, RolePermissionError.prototype);
  }
}

export class StateDriftError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'STATE_DRIFT_DETECTED',
      principle: 'The audit log is the source of truth — state must agree',
      severity: FailureSeverity.externalDataCorruption,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, StateDriftError.prototype);
  }
}

/**
 * Command ordering violation: command arrived out of order.
 * 
 * Commands must be applied in issuedAt order per Equb.
 * If a command arrives "from the past", it is rejected.
 */
export class CommandOrderingError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'COMMAND_ORDERING_VIOLATION',
      principle: 'Commands must be applied in issuedAt order per Equb',
      severity: FailureSeverity.invariantViolation,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, CommandOrderingError.prototype);
  }
}

/**
 * Duplicate command: same commandId was already processed.
 * 
 * Same commandId → must not apply twice.
 * This prevents double payout confirmations, duplicate contribution marks, and backend retry duplication.
 */
export class DuplicateCommandError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'DUPLICATE_COMMAND',
      principle: 'Same commandId must not be applied twice (idempotency)',
      severity: FailureSeverity.invariantViolation,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, DuplicateCommandError.prototype);
  }
}

/**
 * Concurrency violation: concurrent mutations detected.
 * 
 * One Equb = one logical writer at a time.
 * Concurrent mutations are forbidden at domain level.
 */
export class ConcurrencyViolationError extends DomainError {
  constructor(message: string) {
    super(message, {
      code: 'CONCURRENCY_VIOLATION',
      principle: 'One Equb = one logical writer at a time (single-writer rule)',
      severity: FailureSeverity.invariantViolation,
      recoverable: false,
      allowedReaction: AllowedReaction.abortOnly,
    });
    Object.setPrototypeOf(this, ConcurrencyViolationError.prototype);
  }
}

import { FailureSeverity } from '../constants/enums';
import { DomainError } from '../errors/domain_errors';

/**
 * AbortEvent: Evidence emitted when the system aborts.
 * 
 * This is NOT an exception replacement.
 * It is evidence emitted when exceptions occur.
 * 
 * Rules:
 * - Domain-neutral (no business logic)
 * - Immutable (all fields final)
 * - Contains all context needed for forensic analysis
 * - Human-readable reason + technical code
 * 
 * This aligns with principle: "Truth must be observable, or it's useless in production."
 */
export class AbortEvent {
  public readonly errorType: string; // e.g., "StateDriftError", "ForbiddenAction"
  public readonly severity: FailureSeverity;
  public readonly equbId?: string; // If available
  public readonly actorId?: string; // If available
  public readonly commandId?: string; // If available
  public readonly timestamp: Date;
  public readonly humanReadableReason: string;
  public readonly technicalCode: string; // Stable identifier for programmatic handling

  constructor({
    errorType,
    severity,
    equbId,
    actorId,
    commandId,
    timestamp,
    humanReadableReason,
    technicalCode,
  }: {
    errorType: string;
    severity: FailureSeverity;
    equbId?: string;
    actorId?: string;
    commandId?: string;
    timestamp: Date;
    humanReadableReason: string;
    technicalCode: string;
  }) {
    this.errorType = errorType;
    this.severity = severity;
    this.equbId = equbId;
    this.actorId = actorId;
    this.commandId = commandId;
    this.timestamp = timestamp;
    this.humanReadableReason = humanReadableReason;
    this.technicalCode = technicalCode;
  }

  /**
   * Creates an AbortEvent from a DomainError.
   * 
   * This extracts all relevant context from the error for observability.
   */
  static fromDomainError({
    error,
    equbId,
    actorId,
    commandId,
  }: {
    error: DomainError;
    equbId?: string;
    actorId?: string;
    commandId?: string;
  }): AbortEvent {
    // In JS/TS, error.constructor.name gives the class name usually.
    return new AbortEvent({
      errorType: (error as any).constructor.name,
      severity: error.severity,
      equbId,
      actorId,
      commandId,
      timestamp: new Date(),
      humanReadableReason: error.message,
      technicalCode: error.code,
    });
  }

  /** Formats the abort event for human-readable output. */
  toHumanReadableString(): string {
    const lines: string[] = [];
    lines.push('=== SYSTEM ABORT ===');
    lines.push(`Error Type: ${this.errorType}`);
    lines.push(`Severity: ${this.severity}`);
    lines.push(`Technical Code: ${this.technicalCode}`);
    lines.push(`Timestamp: ${this.timestamp.toISOString()}`);
    if (this.equbId) lines.push(`Equb ID: ${this.equbId}`);
    if (this.actorId) lines.push(`Actor ID: ${this.actorId}`);
    if (this.commandId) lines.push(`Command ID: ${this.commandId}`);
    lines.push(`Reason: ${this.humanReadableReason}`);
    lines.push('===================');
    return lines.join('\n');
  }

  /** Formats the abort event for structured logging (JSON-like). */
  toStructuredData(): Record<string, any> {
    const data: Record<string, any> = {
      errorType: this.errorType,
      severity: this.severity,
      technicalCode: this.technicalCode,
      timestamp: this.timestamp.toISOString(),
      humanReadableReason: this.humanReadableReason,
    };
    if (this.equbId) data.equbId = this.equbId;
    if (this.actorId) data.actorId = this.actorId;
    if (this.commandId) data.commandId = this.commandId;
    return data;
  }
}

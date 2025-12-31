import { AuthContext } from '../../application/auth/auth_context';
import { CommandId } from './command_id';
import { EqubId, UserId } from './ids';

/**
 * CommandEnvelope: Wraps a command with metadata for deterministic execution.
 * 
 * Every use-case execution now:
 * - Accepts a CommandEnvelope
 * - Emits audit events linked to commandId
 * 
 * This enforces:
 * - Causality (who issued what, when)
 * - Traceability (commandId links audit events)
 * - Idempotency (same commandId → must not apply twice)
 * - Ordering (issuedAt determines execution order)
 * - Authenticated identity (actorId from AuthContext, not UI/API)
 * 
 * CRITICAL: UI/API cannot supply actorId directly.
 * actorId is injected only from AuthContext.
 * This prevents impersonation and role escalation.
 * 
 * This is not a feature. It is integrity infrastructure.
 */
export class CommandEnvelope {
  public readonly commandId: CommandId;
  public readonly issuedAt: Date;
  public readonly actorId: UserId; // Injected from AuthContext, never from UI/API
  public readonly equbId: EqubId;

  constructor({
    commandId,
    issuedAt,
    actorId,
    equbId,
  }: {
    commandId: CommandId;
    issuedAt: Date;
    actorId: UserId;
    equbId: EqubId;
  }) {
    this.commandId = commandId;
    this.issuedAt = issuedAt;
    this.actorId = actorId;
    this.equbId = equbId;
  }

  /**
   * Creates a CommandEnvelope from AuthContext (authenticated identity only).
   * 
   * This is the ONLY way to create a CommandEnvelope.
   * UI/API cannot supply actorId directly.
   * 
   * Flow: Auth → AuthContext → CommandEnvelope → UseCase → Domain
   */
  static fromAuthContext({
    commandId,
    authContext,
    equbId,
    issuedAt,
  }: {
    commandId: CommandId;
    authContext: AuthContext;
    equbId: EqubId;
    issuedAt?: Date;
  }): CommandEnvelope {
    return new CommandEnvelope({
      commandId,
      issuedAt: issuedAt ?? new Date(),
      actorId: authContext.actorId, // Injected from AuthContext, not UI/API
      equbId,
    });
  }
}

import { UserRole } from '../../core/constants/enums';
import { UserId } from '../../domain/value_objects/ids';

/**
 * AuthenticatedActor: Proof of identity, not a User entity.
 * 
 * This is not a User entity. It is proof of identity, nothing more.
 * 
 * Rules:
 * - Created by auth layer (OTP, token, etc.)
 * - Domain never creates this
 * - Domain never validates tokens
 * - Domain only consumes verified identity
 * 
 * This aligns with principle: "The domain does not trust the UI or backend — only verified inputs."
 */
export class AuthenticatedActor {
  public readonly actorId: UserId;
  public readonly primaryRole: UserRole; // User's primary role (from auth system)

  constructor({
    actorId,
    primaryRole,
  }: {
    actorId: UserId;
    primaryRole: UserRole;
  }) {
    this.actorId = actorId;
    this.primaryRole = primaryRole;
  }

  /**
   * Creates an AuthenticatedActor from verified auth data.
   * 
   * This is called by the auth layer after successful authentication.
   * Domain never calls this directly.
   */
  static fromVerifiedAuth({
    userId,
    role,
  }: {
    userId: string;
    role: string;
  }): AuthenticatedActor {
    return new AuthenticatedActor({
      actorId: new UserId(userId),
      primaryRole: AuthenticatedActor.parseRole(role),
    });
  }

  private static parseRole(role: string): UserRole {
    switch (role.toLowerCase()) {
      case 'member':
        return UserRole.member;
      case 'collector':
        return UserRole.collector;
      case 'admin':
        return UserRole.admin;
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }
}

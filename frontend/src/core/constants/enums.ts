/**
 * AUTHORITATIVE ENUMS
 * These are 1:1 mappings of the Backend Prisma Enums.
 * NO renaming. NO lowercase. NO UI-friendly keys.
 */

export enum GlobalRole {
  ADMIN = 'ADMIN',
  COLLECTOR = 'COLLECTOR',
  MEMBER = 'MEMBER',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COLLECTOR = 'COLLECTOR',
  MEMBER = 'MEMBER',
}

export enum EqubStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  EXECUTED = 'EXECUTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REMOVED = 'REMOVED',
  LEFT = 'LEFT',
}

export enum MembershipRole {
  ADMIN = 'ADMIN',
  COLLECTOR = 'COLLECTOR',
  MEMBER = 'MEMBER',
}

// UI-only constants (Not Backend Enums)
export enum EqubFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

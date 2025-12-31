import { EqubStatus, GlobalRole, ContributionStatus, PayoutStatus, MembershipStatus, MembershipRole } from '../core/constants/enums';

/**
 * HUMBLE DTOs
 * Thin data containers reflecting Backend truth.
 * Strictly Readonly.
 */

export interface UserDto {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly role: GlobalRole;
    readonly createdAt: string;
}

export interface EqubDto {
    readonly id: string;
    readonly name: string;
    readonly totalRounds: number;
    readonly currentRound: number;
    readonly amount: number;
    readonly currency: string;
    readonly frequency: string;
    readonly status: EqubStatus;
    readonly createdByUserId: string;
}

export interface MembershipDto {
    readonly equbId: string;
    readonly userId: string;
    readonly role: MembershipRole;
    readonly status: MembershipStatus;
    readonly joinedAt: string;
}

export interface ContributionDto {
    readonly id: string;
    readonly equbId: string;
    readonly memberId: string;
    readonly roundNumber: number;
    readonly amount: number;
    readonly status: ContributionStatus;
    readonly createdAt: string;
}

export interface PayoutDto {
    readonly id: string;
    readonly equbId: string;
    readonly recipientUserId: string;
    readonly roundNumber: number;
    readonly amount: number;
    readonly status: PayoutStatus;
    readonly scheduledDate?: string;
    readonly executedAt?: string;
}

export interface AuditEventDto {
    readonly id: string;
    readonly timestamp: string;
    readonly actorUserId: string;
    readonly actorRole: string;
    readonly actionType: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly payload: any;
}

export interface LoginResponseDto {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly role: GlobalRole;
}

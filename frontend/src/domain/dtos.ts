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
    readonly language?: string;
    readonly notificationPreferences?: any;
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
    readonly myRole?: string;
}

export interface ManagedEqubDto extends EqubDto {
    readonly memberships?: { role: string }[];
    readonly _count?: { memberships: number };
}

export interface ManagedSummaryDto {
    readonly totalVolume: number;
    readonly totalMembers: number;
    readonly managedCount: number;
    readonly activeCircles: number;
    readonly todayCollected: number;
    readonly todayPending: number;
}

export interface MembershipDto {
    readonly equbId: string;
    readonly userId: string;
    readonly role: MembershipRole;
    readonly status: MembershipStatus;
    readonly joinedAt: string;
    readonly user?: {
        readonly id: string;
        readonly fullName: string;
        readonly email: string;
        readonly role: string;
    };
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
    readonly createdAt: string;
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

export enum NotificationType {
    ROUND_COMPLETE = 'ROUND_COMPLETE',
    EQUB_COMPLETED = 'EQUB_COMPLETED',
    CONTRIBUTION_PENDING = 'CONTRIBUTION_PENDING',
    PAYOUT_RECEIVED = 'PAYOUT_RECEIVED',
    AUDIT_ALERT = 'AUDIT_ALERT',
}

export interface NotificationDto {
    readonly id: string;
    readonly type: NotificationType;
    readonly sourceId: string;
    readonly equbId?: string;
    readonly roundNumber?: number;
    readonly message: string;
    readonly createdAt: string;
}

export interface ContributionNotificationDto {
    readonly memberId: string;
    readonly equbId: string;
    readonly equbName: string;
    readonly roundNumber: number;
    readonly amount: number;
    readonly status: 'PENDING';
}

export interface PayoutNotificationDto {
    readonly memberId: string;
    readonly equbId: string;
    readonly equbName: string;
    readonly roundNumber: number;
    readonly amount: number;
    readonly status: 'EXECUTED';
    readonly executedAt: string;
}

export interface AuditNotificationDto {
    readonly alertId: string;
    readonly equbId: string;
    readonly roundNumber?: number;
    readonly type: string;
    readonly message: string;
    readonly createdAt: string;
}

export interface SystemHealthDto {
    readonly totalContributionsReceived: number;
    readonly totalPayoutsExecuted: number;
    readonly totalVolumeProcessed: number;
    readonly totalRoundsCompleted: number;
    readonly totalEqubsCompleted: number;
    readonly discrepancyCount: number;
    readonly isDegraded: boolean;
    readonly lastIntegrityCheckTimestamp: string;
}

export interface SystemVersionDto {
    readonly version: string;
    readonly commit: string;
    readonly timestamp: string;
    readonly isDegraded: boolean;
    readonly integrityCheckPassed: boolean;
}

export interface StatusFlagsDto {
    readonly isRoundOpen: boolean;
    readonly isFullyFunded: boolean;
    readonly canExecutePayout: boolean;
    readonly isEqubCompleted: boolean;
    readonly currentRound: number;
    readonly totalRounds: number;
    readonly confirmedCount: number;
    readonly settledCount: number;
    readonly memberCount: number;
}

export interface FinancialSummaryDto {
    readonly equbId: string;
    readonly equbName: string;
    readonly totalVolume: number;
    readonly totalSettled: number;
    readonly contributionCount: number;
    readonly completedRounds: number;
    readonly remainingRounds: number;
    readonly activeMemberCount: number;
    readonly contributionAmount: number;
    readonly currency: string;
    readonly status: EqubStatus;
}

export interface RoundLedgerItemDto {
    readonly roundNumber: number;
    readonly expectedAmount: number;
    readonly collectedAmount: number;
    readonly contributionCount: number;
    readonly payoutRecipient: string | null;
    readonly status: string; // Payout status or 'OPEN'/'SKIPPED'
    readonly isCurrent: boolean;
}

export interface AuditTimelineEventDto {
    readonly id: string;
    readonly timestamp: string;
    readonly actor: string;
    readonly action: string;
    readonly description: string;
    readonly status: 'INFO' | 'WARNING' | 'CRITICAL';
    readonly metadata: any;
}

export interface AuditTimelineResponseDto {
    readonly total: number;
    readonly timeline: AuditTimelineEventDto[];
}

export interface IntegrityCheckResultDto {
    readonly isDegraded: boolean;
    readonly violations: string[];
    readonly timestamp: string;
    readonly checkedBy: string;
}

export enum PayoutOrderType {
    RANDOM = 'RANDOM',
    FIXED = 'FIXED',
}

export interface CreateEqubRequestDto {
    readonly name: string;
    readonly contributionAmount: number;
    readonly cycleLength: number; // in days
    readonly startDate: string;
    readonly payoutOrderType: PayoutOrderType;
    readonly totalRounds: number;
}

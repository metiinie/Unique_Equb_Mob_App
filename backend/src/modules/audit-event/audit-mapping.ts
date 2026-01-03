import { AuditActionType, GlobalRole } from '@prisma/client';

export enum ActivitySeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
}

export interface ActivityProjection {
    label: string;
    severity: ActivitySeverity;
    isUserVisible: boolean;
}

export interface ActivityMapping {
    [GlobalRole.MEMBER]: ActivityProjection;
    [GlobalRole.ADMIN]: ActivityProjection;
    [GlobalRole.COLLECTOR]: ActivityProjection;
}

/**
 * AUTHORITATIVE ACTIVITY MAPPING
 * 
 * LINGUISTIC HARDENING (PHASE 10):
 * 1. Factual, outcome-only language.
 * 2. Verb whitelist: added, removed, executed, rejected, confirmed, activated, completed.
 * 3. Max length: ≤ 60 characters.
 * 4. No causal phrasing ("because", "due to").
 */
export const AUDIT_ACTIVITY_MAP: Record<AuditActionType, ActivityMapping> = {
    [AuditActionType.EQUB_CREATED]: {
        [GlobalRole.MEMBER]: { label: 'Equb added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb entity added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb entity added', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.EQUB_ACTIVATED]: {
        [GlobalRole.MEMBER]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.EQUB_ON_HOLD]: {
        [GlobalRole.MEMBER]: { label: 'Equb removed', severity: ActivitySeverity.WARNING, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb removed from active', severity: ActivitySeverity.WARNING, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb removed from active', severity: ActivitySeverity.WARNING, isUserVisible: true },
    },
    [AuditActionType.EQUB_RESUMED]: {
        [GlobalRole.MEMBER]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb activated', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.EQUB_TERMINATED]: {
        [GlobalRole.MEMBER]: { label: 'Equb removed', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb entity removed', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb entity removed', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
    },
    [AuditActionType.EQUB_COMPLETED]: {
        [GlobalRole.MEMBER]: { label: 'Equb completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Equb completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Equb completed', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.MEMBER_ADDED]: {
        [GlobalRole.MEMBER]: { label: 'Membership added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Membership added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Membership added', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.MEMBER_REMOVED]: {
        [GlobalRole.MEMBER]: { label: 'Membership removed', severity: ActivitySeverity.WARNING, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Membership removed', severity: ActivitySeverity.WARNING, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Membership removed', severity: ActivitySeverity.WARNING, isUserVisible: true },
    },
    [AuditActionType.CONTRIBUTION_CREATED]: {
        [GlobalRole.MEMBER]: { label: 'Contribution added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Contribution added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Contribution added', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.CONTRIBUTION_CONFIRMED]: {
        [GlobalRole.MEMBER]: { label: 'Contribution confirmed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Contribution confirmed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Contribution confirmed', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.CONTRIBUTION_REJECTED]: {
        [GlobalRole.MEMBER]: { label: 'Contribution rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Contribution rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Contribution rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
    },
    [AuditActionType.PAYOUT_CREATED]: {
        [GlobalRole.MEMBER]: { label: 'Payout added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Payout added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Payout added', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.PAYOUT_COMPLETED]: {
        [GlobalRole.MEMBER]: { label: 'Payout executed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Payout executed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Payout executed', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.PAYOUT_REJECTED]: {
        [GlobalRole.MEMBER]: { label: 'Payout rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Payout rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Payout rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
    },
    [AuditActionType.ROUND_PROGRESSED]: {
        [GlobalRole.MEMBER]: { label: 'Round added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Round added', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Round added', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.ROUND_CLOSED]: {
        [GlobalRole.MEMBER]: { label: 'Round completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Round completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Round completed', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.CONTRIBUTION_SETTLED]: {
        [GlobalRole.MEMBER]: { label: 'Contribution completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.ADMIN]: { label: 'Contribution completed', severity: ActivitySeverity.INFO, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Contribution completed', severity: ActivitySeverity.INFO, isUserVisible: true },
    },
    [AuditActionType.INTEGRITY_CHECK_FAILED]: {
        [GlobalRole.MEMBER]: { label: 'System removed', severity: ActivitySeverity.CRITICAL, isUserVisible: false },
        [GlobalRole.ADMIN]: { label: 'Integrity check rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
        [GlobalRole.COLLECTOR]: { label: 'Integrity check rejected', severity: ActivitySeverity.CRITICAL, isUserVisible: true },
    },
};

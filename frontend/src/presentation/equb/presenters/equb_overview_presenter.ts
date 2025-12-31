import { Equb } from '../../../domain/entities/equb';
import { Contribution } from '../../../domain/entities/contribution';
import { Payout } from '../../../domain/entities/payout';
import { EqubMember } from '../../../domain/entities/equb_member';

/**
 * View Projection for Equb Overview.
 * 
 * Rules:
 * - NO business logic.
 * - NO status derivation.
 * - Strictly maps domain entities to UI-ready view models.
 */
export interface EqubOverviewViewState {
    title: string;
    contributionAmountLabel: string;
    currentRoundLabel: string;
    progressPercentage: number;
    statusLabel: string;
    nextPayoutMemberLabel: string;
    memberCount: number;
    pendingPayoutsCount: number;
    members: EqubMemberViewState[];
    contributions: ContributionViewState[];
    payouts: PayoutViewState[];
}

export interface EqubMemberViewState {
    id: string;
    name: string;
    role: string;
    status: string;
}

export interface ContributionViewState {
    id: string;
    periodLabel: string;
    memberName: string;
    statusLabel: string;
    actorLabel: string;
    reason: string;
}

export interface PayoutViewState {
    id: string;
    roundLabel: string;
    memberName: string;
    adminConfirmed: boolean;
    memberConfirmed: boolean;
    blockedReason: string;
    statusLabel: string;
}

export class EqubOverviewPresenter {
    static project(
        equb: Equb,
        contributions: Contribution[],
        payouts: Payout[]
    ): EqubOverviewViewState {
        const memberMap = new Map<string, EqubMember>();
        equb.members.forEach(m => memberMap.set(m.memberId.value, m));

        // Note: Calculations like progress percentage are on the edge.
        // If the domain doesn't provide it, the UI renders what it's given.
        // We avoid complex state inference.

        const payoutViewState = payouts.map(p => {
            const member = memberMap.get(p.memberId.value);
            return {
                id: p.id,
                roundLabel: `Round ${p.roundNumber}`,
                memberName: member ? member.name : 'Unknown',
                adminConfirmed: p.status === 'adminConfirmed' || p.status === 'completed',
                memberConfirmed: p.status === 'memberConfirmed' || p.status === 'completed',
                blockedReason: p.blockedReason || '',
                statusLabel: p.status,
            };
        });

        return {
            title: equb.name,
            contributionAmountLabel: `${equb.contributionAmount} ETB`,
            currentRoundLabel: `Round ${equb.currentRoundNumber} of ${equb.totalRounds}`,
            progressPercentage: equb.totalRounds > 0 ? (equb.currentRoundNumber / equb.totalRounds) * 100 : 0,
            statusLabel: equb.status.toUpperCase(),
            nextPayoutMemberLabel: this.findNextPayoutMember(payouts, memberMap),
            memberCount: equb.members.length,
            pendingPayoutsCount: payoutViewState.filter(p => !p.adminConfirmed).length,
            members: equb.members.map(m => ({
                id: m.memberId.value,
                name: m.name,
                role: m.roleInEqub,
                status: m.status,
            })),
            contributions: contributions.map(c => {
                const member = memberMap.get(c.memberId.value);
                return {
                    id: c.id,
                    periodLabel: c.period.toLocaleDateString(),
                    memberName: member ? member.name : 'Unknown',
                    statusLabel: c.status,
                    actorLabel: c.setBy.value,
                    reason: c.reason || '',
                };
            }),
            payouts: payoutViewState,
        };
    }

    private static findNextPayoutMember(payouts: Payout[], memberMap: Map<string, EqubMember>): string {
        const next = payouts.find(p => p.status !== 'completed');
        if (!next) return 'None';
        const member = memberMap.get(next.memberId.value);
        return member ? member.name : next.memberId.value;
    }
}

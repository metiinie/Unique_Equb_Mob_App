import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditActionType, EqubStatus, MembershipRole, MembershipStatus } from '@prisma/client';

export interface ReconstructedState {
    equbId: string;
    status: EqubStatus;
    currentRound: number;
    memberIds: string[];
    collectorIds: string[];
    payoutHistory: { round: number; recipientId: string; amount: number }[];
    totalEventsProcessed: number;
}

@Injectable()
export class LedgerReplayService {
    private readonly logger = new Logger(LedgerReplayService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Replays the Audit Ledger to reconstruct the intended state of an Equb.
     * This is the "Source of Truth" in case of relational data drift.
     */
    async simulateEqubState(equbId: string): Promise<ReconstructedState> {
        // Fetch all events related to this Equb or its sub-entities (Payouts, Contributions)
        // Note: We use a broad search across payload for equbId to catch linked events.
        const events = await this.prisma.auditEvent.findMany({
            where: {
                OR: [
                    { entityType: 'Equb', entityId: equbId },
                    { entityType: 'Payout', payload: { path: ['equbId'], equals: equbId } },
                    { entityType: 'Contribution', payload: { path: ['equbId'], equals: equbId } }
                ]
            },
            orderBy: [
                { timestamp: 'asc' },
                { seqId: 'asc' }
            ]
        });

        if (events.length === 0) {
            throw new NotFoundException(`No audit history found for Equb ${equbId}`);
        }

        const state: ReconstructedState = {
            equbId: equbId,
            status: EqubStatus.DRAFT,
            currentRound: 1,
            memberIds: [],
            collectorIds: [],
            payoutHistory: [],
            totalEventsProcessed: events.length
        };

        const activeMembers = new Set<string>();
        const activeCollectors = new Set<string>();

        // Replay Engine
        for (const event of events) {
            const payload = event.payload as any;

            switch (event.actionType) {
                case AuditActionType.EQUB_CREATED:
                    state.status = EqubStatus.DRAFT;
                    break;

                case AuditActionType.EQUB_ACTIVATED:
                    state.status = EqubStatus.ACTIVE;
                    break;

                case AuditActionType.ROUND_PROGRESSED:
                    // Support both old and new payload structures
                    state.currentRound = payload.toRound || (state.currentRound + 1);
                    break;

                case AuditActionType.ROUND_CLOSED:
                    // Round closed implicitly means currentRound has finished its lifecycle
                    break;

                case AuditActionType.PAYOUT_COMPLETED:
                    state.payoutHistory.push({
                        round: payload.roundNumber,
                        recipientId: payload.recipientId,
                        amount: payload.payoutAmount
                    });
                    // Defensive: advanced round might be logged here or separately
                    if (payload.isFinalRound) {
                        state.status = EqubStatus.COMPLETED;
                    }
                    break;

                case AuditActionType.MEMBER_ADDED:
                    if (payload.role === 'MEMBER') activeMembers.add(payload.userId);
                    if (payload.role === 'COLLECTOR') activeCollectors.add(payload.userId);
                    break;

                case AuditActionType.MEMBER_REMOVED:
                    activeMembers.delete(payload.userId);
                    activeCollectors.delete(payload.userId);
                    break;

                case AuditActionType.EQUB_ON_HOLD:
                    state.status = EqubStatus.ON_HOLD;
                    break;

                case AuditActionType.EQUB_RESUMED:
                    state.status = EqubStatus.ACTIVE;
                    break;

                case AuditActionType.EQUB_TERMINATED:
                    state.status = EqubStatus.TERMINATED;
                    break;

                case AuditActionType.EQUB_COMPLETED:
                    state.status = EqubStatus.COMPLETED;
                    break;
            }
        }

        state.memberIds = Array.from(activeMembers);
        state.collectorIds = Array.from(activeCollectors);

        return state;
    }

    /**
     * Compares simulation against actual DB state and reports drift.
     */
    async detectDrift(equbId: string) {
        const reconstructed = await this.simulateEqubState(equbId);
        const actual = await this.prisma.equb.findUnique({
            where: { id: equbId },
            include: {
                memberships: { where: { status: MembershipStatus.ACTIVE } }
            }
        });

        if (!actual) return { drifting: true, reason: 'Equb missing from relational table' };

        const drift = {
            drifting: false,
            fields: [] as string[],
            reconstructed,
            actual: {
                status: actual.status,
                currentRound: actual.currentRound,
                memberCount: actual.memberships.filter(m => m.role === MembershipRole.MEMBER).length,
                collectorCount: actual.memberships.filter(m => m.role === MembershipRole.COLLECTOR).length
            }
        };

        if (reconstructed.status !== actual.status) {
            drift.drifting = true;
            drift.fields.push('status');
        }

        if (reconstructed.currentRound !== actual.currentRound) {
            drift.drifting = true;
            drift.fields.push('currentRound');
        }

        if (reconstructed.memberIds.length !== drift.actual.memberCount) {
            drift.drifting = true;
            drift.fields.push('memberCount');
        }

        return drift;
    }
}

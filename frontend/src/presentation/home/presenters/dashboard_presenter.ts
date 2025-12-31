import { Equb } from '../../domain/entities/equb';

export interface DashboardViewState {
    title: string;
    greeting: string;
    stats: {
        label: string;
        value: string | number;
        icon: string;
    }[];
    equbs: {
        id: string;
        name: string;
        status: string;
        memberCount: number;
        progress: number;
    }[];
}

export class DashboardPresenter {
    static projectAdmin(equbs: Equb[]): DashboardViewState {
        return {
            title: 'Administrator',
            greeting: 'Good evening, Steward',
            stats: [
                { label: 'ACTIVE EQUBS', value: equbs.filter(e => e.status === 'active').length, icon: '📈' },
                { label: 'PENDING TASKS', value: 8, icon: '🔔' }, // Hardcoded for now until we have task tracking
            ],
            equbs: equbs.map(e => ({
                id: e.id.value,
                name: e.name,
                status: e.status,
                memberCount: e.members.length,
                progress: e.totalRounds > 0 ? (e.currentRoundNumber / e.totalRounds) * 100 : 0,
            })),
        };
    }

    static projectMember(equbs: Equb[], memberName: string): DashboardViewState {
        return {
            title: 'Member',
            greeting: `Welcome back, ${memberName}`,
            stats: [
                { label: 'YOUR EQUBS', value: equbs.length, icon: '🤝' },
                { label: 'PAYOUTS DUE', value: 1, icon: '💰' },
            ],
            equbs: equbs.map(e => ({
                id: e.id.value,
                name: e.name,
                status: e.status,
                memberCount: e.members.length,
                progress: e.totalRounds > 0 ? (e.currentRoundNumber / e.totalRounds) * 100 : 0,
            })),
        };
    }
}

import { ApiClient } from '../../src/presentation/services/api_client';

/**
 * UNIT TESTS: AUDIT & COMPLETION FLOW (Humble)
 * 
 * Verifies:
 * 1. Audit events fetching.
 * 2. Latest payout retrieval.
 * 3. Completion data loading.
 */

describe('Audit & Completion Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn() as any;
    });

    it('should fetch audit events from backend', async () => {
        const mockEvents = [
            { id: 'a-1', actionType: 'EQUB_ACTIVATED', timestamp: new Date().toISOString() }
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify(mockEvents)),
        });

        const data = await ApiClient.get<any[]>('/equbs/e-1/audit-events');

        expect(data).toHaveLength(1);
        expect(data[0].actionType).toBe('EQUB_ACTIVATED');
    });

    it('should fetch latest payout summary', async () => {
        const mockPayout = { id: 'p-1', roundNumber: 5, amount: 5000, status: 'EXECUTED' };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify(mockPayout)),
        });

        const data = await ApiClient.get<any>('/equbs/e-1/payouts/latest');

        expect(data.roundNumber).toBe(5);
        expect(data.amount).toBe(5000);
    });

    it('should fetch completion data in parallel', async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify({ id: 'e-1', status: 'COMPLETED' })) })
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify([{ id: 'c-1', amount: 500 }])) })
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify([{ id: 'p-1', amount: 5000 }])) })
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify([])) });

        const [equb, contributions, payouts, audit] = await Promise.all([
            ApiClient.get<any>('/equbs/e-1'),
            ApiClient.get<any[]>('/equbs/e-1/contributions'),
            ApiClient.get<any[]>('/equbs/e-1/payouts'),
            ApiClient.get<any[]>('/equbs/e-1/audit-events'),
        ]);

        expect(equb.status).toBe('COMPLETED');
        expect(contributions).toHaveLength(1);
        expect(payouts).toHaveLength(1);
        expect(audit).toHaveLength(0);
    });
});

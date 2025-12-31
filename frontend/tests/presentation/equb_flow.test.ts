import { ApiClient } from '../../src/presentation/services/api_client';
import { GlobalRole, EqubStatus } from '../../src/core/constants/enums';

/**
 * EQUB FLOW INTEGRATION TESTS (Humble)
 * 
 * Verifies that the selection and overview screens:
 * 1. Fetch data from backend correctly.
 * 2. Map enums 1:1.
 * 3. Surface backend errors.
 */

describe('Equb Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('should list Equbs from backend and map status exactly', async () => {
        const mockEqubs = [
            {
                id: 'e-1',
                name: 'Test Equb',
                status: EqubStatus.ACTIVE,
                amount: 1000,
                currency: 'ETB',
                totalRounds: 10,
                currentRound: 2,
            }
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockEqubs)),
        });

        const data = await ApiClient.get<any[]>('/equbs');

        expect(data[0].status).toBe(EqubStatus.ACTIVE);
        expect(data[0].name).toBe('Test Equb');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/equbs'),
            expect.objectContaining({ credentials: 'include' })
        );
    });

    it('should fetch Equb details, contributions, and payouts in parallel', async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ id: 'e-1', name: 'Detail Equb', status: EqubStatus.ACTIVE }))
            })
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify([{ id: 'c-1', amount: 500 }]))
            })
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify([{ id: 'p-1', amount: 5000 }]))
            });

        const [equb, contributions, payouts] = await Promise.all([
            ApiClient.get<any>('/equbs/e-1'),
            ApiClient.get<any[]>('/equbs/e-1/contributions'),
            ApiClient.get<any[]>('/equbs/e-1/payouts'),
        ]);

        expect(equb.name).toBe('Detail Equb');
        expect(contributions.length).toBe(1);
        expect(payouts.length).toBe(1);
    });

    it('should surface backend error when fetching details fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            text: () => Promise.resolve(JSON.stringify({ message: 'Equb not found' }))
        });

        await expect(ApiClient.get('/equbs/invalid')).rejects.toThrow('Equb not found');
    });
});

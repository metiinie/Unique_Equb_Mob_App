import { ApiClient } from '../../src/presentation/services/api_client';
import { GlobalRole, EqubStatus, ContributionStatus } from '../../src/core/constants/enums';

/**
 * UNIT TESTS: CONTRIBUTION FLOW (Humble)
 * 
 * Verifies:
 * 1. Contribution creation intent.
 * 2. Contribution management (confirm/reject).
 * 3. Payout execution intent.
 */

describe('Contribution Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    describe('Member Contribution', () => {
        it('should send POST request to contribute with correct amount', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: () => Promise.resolve(JSON.stringify({ id: 'c-1' })),
            });

            await ApiClient.post('/equbs/e-1/contribute', { amount: 5000 });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/equbs/e-1/contribute'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ amount: 5000 }),
                })
            );
        });

        it('should surface conflict error if member already contributed', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 409,
                text: () => Promise.resolve(JSON.stringify({ message: 'Already contributed for this round' })),
            });

            await expect(ApiClient.post('/equbs/e-1/contribute', { amount: 5000 }))
                .rejects.toThrow('Already contributed for this round');
        });
    });

    describe('Collector Management', () => {
        it('should confirm a contribution via POST', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('OK'),
            });

            await ApiClient.post('/contributions/c-1/confirm', {});

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/contributions/c-1/confirm'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should reject a contribution via POST', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('OK'),
            });

            await ApiClient.post('/contributions/c-1/reject', { reason: 'Invalid proof' });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/contributions/c-1/reject'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ reason: 'Invalid proof' }),
                })
            );
        });
    });

    describe('Admin Payout', () => {
        it('should trigger payout execution intent', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await ApiClient.post('/equbs/e-1/payouts/execute', {});

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/equbs/e-1/payouts/execute'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should fail if contributions are incomplete', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: () => Promise.resolve(JSON.stringify({ message: 'Contributions incomplete' })),
            });

            await expect(ApiClient.post('/equbs/e-1/payouts/execute', {}))
                .rejects.toThrow('Contributions incomplete');
        });
    });
});

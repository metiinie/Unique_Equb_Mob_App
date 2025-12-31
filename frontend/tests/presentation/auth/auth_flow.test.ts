import { ApiClient } from '../../../src/presentation/services/api_client';
import { GlobalRole } from '../../../src/core/constants/enums';

/**
 * UNIT TESTS: AUTH FLOW (MOCKED API)
 * 
 * Verifies that the frontend humble layer correctly:
 * 1. Sends intents to the backend.
 * 2. Handles successful responses.
 * 3. Handles and surfaces errors.
 */

describe('Auth Flow Integration (Humble)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock global fetch
        global.fetch = jest.fn();
    });

    describe('Login intent', () => {
        it('should send correct credentials and return UserDto on success', async () => {
            const mockUser = {
                id: 'u-1',
                email: 'test@example.com',
                fullName: 'Test User',
                role: GlobalRole.ADMIN,
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockUser)),
            });

            const result = await ApiClient.post('/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'password123',
                    }),
                    credentials: 'include',
                })
            );
            expect(result).toEqual(mockUser);
        });

        it('should surface backend error message on 401 Unauthorized', async () => {
            const backendError = { message: 'Invalid credentials' };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: () => Promise.resolve(JSON.stringify(backendError)),
            });

            await expect(ApiClient.post('/auth/login', {
                email: 'wrong@example.com',
                password: 'wrong',
            })).rejects.toThrow('Invalid credentials');
        });
    });

    describe('Session bootstrap (Me)', () => {
        it('should return UserDto if session is valid', async () => {
            const mockUser = {
                id: 'u-1',
                email: 'test@example.com',
                fullName: 'Test User',
                role: GlobalRole.MEMBER,
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockUser)),
            });

            const result = await ApiClient.get('/auth/me');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/me'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                })
            );
            expect(result).toEqual(mockUser);
        });

        it('should throw error if session is expired or missing', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: () => Promise.resolve('Unauthorized'),
            });

            await expect(ApiClient.get('/auth/me')).rejects.toThrow('Unauthorized');
        });
    });
});

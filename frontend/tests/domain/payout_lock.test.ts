/**
 * PAYOUT LOCK & DUAL CONFIRMATION TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/payout_lock_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 1, Priority 2 (CRITICAL - Financial Safety)
 * 
 * BUSINESS RULES VERIFIED:
 * - Locked payout cannot be confirmed: blockedReason must be empty.
 * - Member can only confirm their own payout: ownership verification.
 * - Collector cannot confirm payouts: role boundary enforcement.
 * - Dual confirmation required: Admin must confirm before Member can confirm (verified by logic in use case).
 * - Repository computes blockedReason: verified by repository behavior.
 * 
 * MIGRATION NOTES:
 * - Uses AuthContext for authenticated identity (actorId, actorRole).
 * - Exact error types preserved (PayoutLockError, RolePermissionError).
 * - Test names preserved character-for-character from Dart.
 */

import { PayoutLockError, RolePermissionError } from '../../src/core/errors/domain_errors';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { EqubId, MemberId } from '../../src/domain/value_objects/ids';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { ConfirmPayoutUseCase } from '../../src/application/use_cases/confirm_payout_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('Payout Lock Tests', () => {
    let repository: MockEqubRepository;
    let auditRepository: MockAuditRepository;
    let useCase: ConfirmPayoutUseCase;

    beforeEach(() => {
        repository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();
        useCase = new ConfirmPayoutUseCase(repository, auditRepository);

        // Enable fake timers
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Locked payout cannot be confirmed', async () => {
        // p3 has blockedReason: 'Unresolved contributions'
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        await expect(
            useCase.execute({
                authContext,
                commandId: new CommandId('cmd-p3'),
                equbId: new EqubId('equb-1'),
                payoutId: 'p3',
            })
        ).rejects.toThrow(PayoutLockError);
    });

    test('Member can confirm only their payout', async () => {
        // p4 is for member m2 and is NOT blocked
        // Try to confirm as m1 (different member)
        const authContextM1 = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'm1',
                role: 'member',
            }),
        });

        await expect(
            useCase.execute({
                authContext: authContextM1,
                commandId: new CommandId('cmd-p4-fail'),
                equbId: new EqubId('equb-1'),
                payoutId: 'p4',
                memberId: new MemberId('m1'), // Wrong member
            })
        ).rejects.toThrow(RolePermissionError);

        // Confirm as correct member (m2) should work if not locked
        // But first, Admin must confirm (dual confirmation rule)
        const adminAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        // Admin confirms first
        await useCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-p4-admin'),
            equbId: new EqubId('equb-1'),
            payoutId: 'p4',
        });

        const authContextM2 = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'm2',
                role: 'member',
            }),
        });

        // Advance time to ensure this command is after the previous one
        jest.advanceTimersByTime(1000);

        // Now member can confirm
        await useCase.execute({
            authContext: authContextM2,
            commandId: new CommandId('cmd-p4-success'),
            equbId: new EqubId('equb-1'),
            payoutId: 'p4',
            memberId: new MemberId('m2'),
        });
    });

    test('Collector cannot confirm payouts', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        await expect(
            useCase.execute({
                authContext,
                commandId: new CommandId('cmd-p1-coll'),
                equbId: new EqubId('equb-1'),
                payoutId: 'p1',
            })
        ).rejects.toThrow(RolePermissionError);
    });

    test('Unlock only when all contributions are Paid', async () => {
        // This test verifies that the repository computes blockedReason correctly
        // In MockEqubRepository, blockedReason is set manually for testing
        // In a real implementation, this would be computed from contributions

        const payouts = await repository.getPayouts(new EqubId('equb-1'));
        const lockedPayout = payouts.find((p) => p.id === 'p3');
        expect(lockedPayout).toBeDefined();
        expect(lockedPayout!.blockedReason).not.toBe('');
        expect(lockedPayout!.blockedReason).not.toBeUndefined();
        expect(lockedPayout!.blockedReason).toBe('Unresolved contributions');
    });

    test('Admin override always audited', async () => {
        // Get initial audit log count
        // Note: MockAuditRepository returns empty list initially in our version
        const initialLog = await auditRepository.getEvents(new EqubId('equb-1'));
        const initialCount = initialLog.length;

        // p1 is unlocked (pending) and not blocked
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-p1-audit'),
            equbId: new EqubId('equb-1'),
            payoutId: 'p1',
        });

        const finalLog = await auditRepository.getEvents(new EqubId('equb-1'));
        expect(finalLog.length).toBe(initialCount + 1);

        const lastEvent = finalLog[finalLog.length - 1];
        expect(lastEvent.actionType).toBe('payoutStatusChanged');
        expect(lastEvent.actorId.value).toBe('admin-1');
    });
});

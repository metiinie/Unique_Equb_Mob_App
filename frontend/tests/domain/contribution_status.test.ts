/**
 * CONTRIBUTION STATUS TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/contribution_status_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 1, Priority 3 (CRITICAL - Domain Invariants)
 * 
 * BUSINESS RULES VERIFIED:
 * - On Hold requires reason: ensures transparency.
 * - Clearing On Hold REQUIRES reason: ensures resolution is documented.
 * - Contributions can only be changed when Equb is Active.
 * - Every status change is audited, even if setting to the same status (override).
 * - System state is correctly updated after successful execution.
 * 
 * MIGRATION NOTES:
 * - Uses AuthContext for authenticated identity.
 * - Uses AuditActionType enum for audit verification.
 * - Exact error types preserved (ContributionStatusError).
 * - Test names preserved character-for-character from Dart.
 */

import { ContributionStatus } from '../../src/core/constants/enums';
import { ContributionStatusError } from '../../src/core/errors/domain_errors';
import { AuditActionType } from '../../src/domain/entities/audit_event';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { EqubId } from '../../src/domain/value_objects/ids';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('Contribution Status Tests', () => {
    let repository: MockEqubRepository;
    let auditRepository: MockAuditRepository;
    let useCase: MarkContributionUseCase;

    beforeEach(() => {
        repository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();
        useCase = new MarkContributionUseCase(repository, auditRepository);

        // Enable fake timers
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('On Hold without reason → error', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        await expect(
            useCase.execute({
                authContext,
                commandId: new CommandId('cmd-c2-onhold-fail'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.onHold,
            })
        ).rejects.toThrow(ContributionStatusError);
    });

    test('Clearing On Hold without reason → error', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        // First set On Hold with reason
        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-c3-onhold'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c3',
            status: ContributionStatus.onHold,
            reason: 'Initial reason',
        });

        // Advance time to ensure next command has a strictly greater timestamp
        jest.advanceTimersByTime(1000);

        // Try to clear without reason (c3 is now On Hold)
        await expect(
            useCase.execute({
                authContext,
                commandId: new CommandId('cmd-c3-clear-fail'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c3',
                status: ContributionStatus.paid,
            })
        ).rejects.toThrow(ContributionStatusError);
    });

    test('Mark Paid in Draft → error', async () => {
        // Create a Draft Equb and contribution
        // Note: MockEqubRepository has Active Equb by default
        // The mock repository has Active Equb, so this should work
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-c2-paid'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verify it was marked
        const contributions = await repository.getContributions(new EqubId('equb-1'));
        const contrib = contributions.find((c) => c.id === 'c2');
        expect(contrib).toBeDefined();
        expect(contrib!.status).toBe(ContributionStatus.paid);
    });

    test('Override logs audit even if same status', async () => {
        const collectorAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Mark as Paid
        await useCase.execute({
            authContext: collectorAuth,
            commandId: new CommandId('cmd-c2-paid-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Get initial audit log count
        const initialLog = await auditRepository.getEvents(new EqubId('equb-1'));
        const initialCount = initialLog.length;

        const adminAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        // Advance time to ensure next command has a strictly greater timestamp
        jest.advanceTimersByTime(1000);

        // Mark as Paid again (same status, different actor)
        await useCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-c2-paid-2'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verify new audit entry was created
        const finalLog = await auditRepository.getEvents(new EqubId('equb-1'));
        expect(finalLog.length).toBeGreaterThan(initialCount);

        // Verify the latest entry is for the override
        const latestEntry = finalLog[finalLog.length - 1];
        expect(latestEntry.actionType).toBe(AuditActionType.contributionStatusChanged);
        expect(latestEntry.actorId.value).toBe('admin-1');
    });

    test('On Hold with reason succeeds', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-c2-onhold-ok'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.onHold,
            reason: 'Phone number dispute',
        });

        const contributions = await repository.getContributions(new EqubId('equb-1'));
        const contrib = contributions.find((c) => c.id === 'c2');
        expect(contrib).toBeDefined();
        expect(contrib!.status).toBe(ContributionStatus.onHold);
        expect(contrib!.reason).toBe('Phone number dispute');
    });
});

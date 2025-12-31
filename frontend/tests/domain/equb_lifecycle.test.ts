/**
 * EQUB LIFECYCLE TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/equb_lifecycle_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 2, Priority 4 (Domain Invariants)
 * 
 * BUSINESS RULES VERIFIED:
 * - Strict State Transitions: Draft → Planned → Active → Completed.
 * - No State Skipping: Cannot skip states (e.g., Draft → Active).
 * - Operation Restrictions: Cannot edit details or members in Completed state.
 * - No State Reversion: Cannot revert from Completed back to Active.
 * - Reason Mandatory for Cancellation: Canceling an Equb requires a reason.
 * 
 * MIGRATION NOTES:
 * - Exact error types preserved (EqubLifecycleError).
 * - Test names preserved character-for-character from Dart.
 * - Uses MockEqubRepository for in-memory state.
 */

import { EqubStatus, EqubFrequency, UserRole } from '../../src/core/constants/enums';
import { EqubLifecycleError } from '../../src/core/errors/domain_errors';
import { Equb } from '../../src/domain/entities/equb';
import { EqubId, UserId } from '../../src/domain/value_objects/ids';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { ChangeEqubStatusUseCase } from '../../src/application/use_cases/change_equb_status_use_case';
import { UpdateEqubDetailsUseCase } from '../../src/application/use_cases/update_equb_details_use_case';
import { UpdateMembersUseCase } from '../../src/application/use_cases/update_members_use_case';

describe('Equb Lifecycle Tests', () => {
    let repository: MockEqubRepository;
    let auditRepository: MockAuditRepository;
    let changeStatusUseCase: ChangeEqubStatusUseCase;
    let updateDetailsUseCase: UpdateEqubDetailsUseCase;
    let updateMembersUseCase: UpdateMembersUseCase;

    const adminAuth = new AuthContext({
        authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
            userId: 'admin-1',
            role: 'admin',
        }),
    });

    beforeEach(() => {
        repository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();
        changeStatusUseCase = new ChangeEqubStatusUseCase(repository, auditRepository);
        updateDetailsUseCase = new UpdateEqubDetailsUseCase(repository, auditRepository);
        updateMembersUseCase = new UpdateMembersUseCase(repository, auditRepository);

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Draft → Planned → Active → Completed works', async () => {
        // Create a new Equb in Draft state
        const draftEqub = new Equb({
            id: new EqubId('test-equb'),
            name: 'Test Equb',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(2025, 1, 1),
            status: EqubStatus.draft,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 0,
            totalRounds: 0,
        });
        await repository.createEqub(draftEqub, new CommandId('cmd-create'));

        // Draft → Planned
        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('test-equb'),
            newStatus: EqubStatus.planned,
        });

        let equb = await repository.getEqubById(new EqubId('test-equb'));
        expect(equb.status).toBe(EqubStatus.planned);

        jest.advanceTimersByTime(1000);

        // Planned → Active
        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-2'),
            equbId: new EqubId('test-equb'),
            newStatus: EqubStatus.active,
        });

        equb = await repository.getEqubById(new EqubId('test-equb'));
        expect(equb.status).toBe(EqubStatus.active);

        jest.advanceTimersByTime(1000);

        // Active → Completed
        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-3'),
            equbId: new EqubId('test-equb'),
            newStatus: EqubStatus.completed,
        });

        equb = await repository.getEqubById(new EqubId('test-equb'));
        expect(equb.status).toBe(EqubStatus.completed);
    });

    test('Skipping states fails', async () => {
        const draftEqub = new Equb({
            id: new EqubId('test-equb-2'),
            name: 'Test Equb 2',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(2025, 1, 1),
            status: EqubStatus.draft,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 0,
            totalRounds: 0,
        });
        await repository.createEqub(draftEqub, new CommandId('cmd-create-2'));

        // Draft → Active (skipping Planned) should fail
        await expect(
            changeStatusUseCase.execute({
                authContext: adminAuth,
                commandId: new CommandId('cmd-skip'),
                equbId: new EqubId('test-equb-2'),
                newStatus: EqubStatus.active,
            })
        ).rejects.toThrow(EqubLifecycleError);
    });

    test('Editing in Completed fails', async () => {
        // Use seeded equb-1 (which is active), but set it to completed first
        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-complete-1'),
            equbId: new EqubId('equb-1'),
            newStatus: EqubStatus.completed,
        });

        jest.advanceTimersByTime(1000);

        // Try to update details
        await expect(
            updateDetailsUseCase.execute({
                authContext: adminAuth,
                commandId: new CommandId('cmd-fail-details'),
                equbId: new EqubId('equb-1'),
                name: 'New Name',
            })
        ).rejects.toThrow(EqubLifecycleError);

        jest.advanceTimersByTime(1000);

        // Try to update members
        await expect(
            updateMembersUseCase.execute({
                authContext: adminAuth,
                commandId: new CommandId('cmd-fail-members'),
                equbId: new EqubId('equb-1'),
                members: [],
            })
        ).rejects.toThrow(EqubLifecycleError);
    });

    test('Cannot revert from Completed', async () => {
        const completedEqub = new Equb({
            id: new EqubId('test-completed'),
            name: 'Completed Equb',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(2025, 0, 1),
            status: EqubStatus.completed,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 12,
            totalRounds: 12,
        });
        await repository.createEqub(completedEqub, new CommandId('cmd-create-3'));

        // Try to revert to Active
        await expect(
            changeStatusUseCase.execute({
                authContext: adminAuth,
                commandId: new CommandId('cmd-revert-fail'),
                equbId: new EqubId('test-completed'),
                newStatus: EqubStatus.active,
            })
        ).rejects.toThrow(EqubLifecycleError);
    });

    test('Canceled requires reason', async () => {
        const activeEqub = new Equb({
            id: new EqubId('test-cancel'),
            name: 'Test Cancel',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(2025, 0, 1),
            status: EqubStatus.active,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });
        await repository.createEqub(activeEqub, new CommandId('cmd-create-4'));

        // Cancel without reason should fail
        await expect(
            changeStatusUseCase.execute({
                authContext: adminAuth,
                commandId: new CommandId('cmd-cancel-fail'),
                equbId: new EqubId('test-cancel'),
                newStatus: EqubStatus.canceled,
            })
        ).rejects.toThrow(EqubLifecycleError);

        // Cancel with reason should succeed
        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-cancel-ok'),
            equbId: new EqubId('test-cancel'),
            newStatus: EqubStatus.canceled,
            reason: 'Test cancellation reason',
        });
        const equb = await repository.getEqubById(new EqubId('test-cancel'));
        expect(equb.status).toBe(EqubStatus.canceled);
    });
});

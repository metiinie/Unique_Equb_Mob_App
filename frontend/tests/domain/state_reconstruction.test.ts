/**
 * STATE RECONSTRUCTION TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/state_reconstruction_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 2, Priority 5 (Domain Invariants / Data Integrity)
 * 
 * BUSINESS RULES VERIFIED:
 * - Determinism: Same events must lead to the same derived state.
 * - Replay Correctness: Derived state must match current state after actions.
 * - Audit Sequence Validation: Replay must fail on impossible sequences.
 * - Drift Detection: Verify consistency between current state and audit replay.
 * 
 * MIGRATION NOTES:
 * - Uses AuditReplayer and DerivedEqubState.
 * - Exact test names preserved.
 * - Uses AuthContext for use cases that require it.
 */

import { ContributionStatus, EqubStatus, EqubFrequency, UserRole } from '../../src/core/constants/enums';
import { DomainError } from '../../src/core/errors/domain_errors';
import { AuditReplayer } from '../../src/domain/audit/audit_replayer';
import { AuditEvent } from '../../src/domain/entities/audit_event';
import { Equb } from '../../src/domain/entities/equb';
import { EqubId, UserId } from '../../src/domain/value_objects/ids';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { VerifyEqubConsistencyUseCase } from '../../src/application/use_cases/verify_equb_consistency_use_case';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { ChangeEqubStatusUseCase } from '../../src/application/use_cases/change_equb_status_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('State Reconstruction Tests', () => {
    let equbRepository: MockEqubRepository;
    let auditRepository: MockAuditRepository;

    beforeEach(() => {
        equbRepository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();

        // Use fake timers for deterministic command timestamps
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Fresh Equb → replay = current state', async () => {
        const equb = await equbRepository.getEqubById(new EqubId('equb-1'));
        const events = await auditRepository.getEvents(new EqubId('equb-1'));

        // Replay with no events should return initial state
        const derivedState = AuditReplayer.replay({
            initialEqub: equb,
            events: events,
        });

        expect(derivedState.equb.status).toBe(equb.status);
    });

    test('After N actions → replay = current state', async () => {
        const markUseCase = new MarkContributionUseCase(equbRepository, auditRepository);
        const changeStatusUseCase = new ChangeEqubStatusUseCase(equbRepository, auditRepository);

        const collectorAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });



        const adminAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'admin-1',
                role: 'admin',
            }),
        });

        // Perform actions
        await markUseCase.execute({
            authContext: collectorAuth,
            commandId: new CommandId('cmd-c2-mark'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        jest.advanceTimersByTime(1000);

        await changeStatusUseCase.execute({
            authContext: adminAuth,
            commandId: new CommandId('cmd-status-complete'),
            equbId: new EqubId('equb-1'),
            newStatus: EqubStatus.completed,
        });

        // Get current state
        const currentEqub = await equbRepository.getEqubById(new EqubId('equb-1'));
        const currentContributions = await equbRepository.getContributions(new EqubId('equb-1'));

        // Get audit events
        const events = await auditRepository.getEvents(new EqubId('equb-1'));

        // Replay
        // We need the ACTUAL initial state for replay to work correctly in drift detection
        // But here we're testing the logic of replay itself.
        // We'll use the original state from mock repo.
        const freshMockRepo = new MockEqubRepository();
        const initialEqub = await freshMockRepo.getEqubById(new EqubId('equb-1'));

        const derivedState = AuditReplayer.replay({
            initialEqub: initialEqub,
            events: events,
        });

        // Verify Equb status matches
        expect(derivedState.equb.status).toBe(currentEqub.status);

        // Verify contribution status matches
        const currentC2 = currentContributions.find((c) => c.id === 'c2');
        const derivedC2 = Array.from(derivedState.getContributions()).find((c) => c.id === 'c2');

        expect(currentC2).toBeDefined();
        expect(derivedC2).toBeDefined();
        expect(derivedC2!.status).toBe(currentC2!.status);
    });

    test('If audit sequence is invalid → replay fails', () => {
        const equb = new Equb({
            id: new EqubId('test-1'),
            name: 'Test',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(),
            status: EqubStatus.active,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });

        // Replay should fail because we can't verify previous status
        // Initial contribution status in replayer is derived from event if not existing, 
        // but if it exists, it checks against previousValue.
        // In our case, the replayer creates it with previousStatus if not found, 
        // then sets it to newStatus. To fail, we'd need multiple events or a mismatch.

        // Actually, let's look at replayer logic:
        // if (!existing) { existing = new ... status: previousStatus }
        // then if (existing.status !== previousStatus) throw ...

        // To trigger failure, we need TWO events for same contribution where e2.previous != e1.new
        const event1 = AuditEvent.contributionStatusChanged({
            id: 'e1',
            equbId: new EqubId('test-1'),
            timestamp: new Date('2025-01-01T10:00:00Z'),
            actorId: new UserId('admin-1'),
            actorRole: UserRole.admin,
            contributionId: 'c1',
            previousStatus: ContributionStatus.unpaid,
            newStatus: ContributionStatus.paid,
            commandId: new CommandId('cmd-1'),
        });

        const event2Mismatched = AuditEvent.contributionStatusChanged({
            id: 'e2',
            equbId: new EqubId('test-1'),
            timestamp: new Date('2025-01-01T11:00:00Z'),
            actorId: new UserId('admin-1'),
            actorRole: UserRole.admin,
            contributionId: 'c1',
            previousStatus: ContributionStatus.unpaid, // SHOULD BE 'paid'
            newStatus: ContributionStatus.onHold,
            commandId: new CommandId('cmd-2'),
        });

        expect(
            () => AuditReplayer.replay({
                initialEqub: equb,
                events: [event1, event2Mismatched],
            })
        ).toThrow(DomainError);
    });

    test('Drift detection: mismatch detected', async () => {
        const verifyUseCase = new VerifyEqubConsistencyUseCase(equbRepository, auditRepository);

        const collectorAuth = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Perform action that creates audit event
        const markUseCase = new MarkContributionUseCase(equbRepository, auditRepository);
        await markUseCase.execute({
            authContext: collectorAuth,
            commandId: new CommandId('cmd-c2-mark'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verification should not throw if state is consistent
        await expect(verifyUseCase.execute(new EqubId('equb-1'))).resolves.not.toThrow();
    });

    test('Replay is deterministic: same events = same result', () => {
        const equb = new Equb({
            id: new EqubId('test-1'),
            name: 'Test',
            contributionAmount: 100,
            frequency: EqubFrequency.monthly,
            startDate: new Date(),
            status: EqubStatus.active,
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });

        const event1 = AuditEvent.contributionStatusChanged({
            id: 'e1',
            equbId: new EqubId('test-1'),
            timestamp: new Date('2025-01-01T10:00:00Z'),
            actorId: new UserId('admin-1'),
            actorRole: UserRole.admin,
            contributionId: 'c1',
            previousStatus: ContributionStatus.unpaid,
            newStatus: ContributionStatus.paid,
            commandId: new CommandId('cmd-1'),
        });

        const event2 = AuditEvent.contributionStatusChanged({
            id: 'e2',
            equbId: new EqubId('test-1'),
            timestamp: new Date('2025-01-01T11:00:00Z'),
            actorId: new UserId('admin-1'),
            actorRole: UserRole.admin,
            contributionId: 'c1',
            previousStatus: ContributionStatus.paid,
            newStatus: ContributionStatus.onHold,
            reason: 'Test reason',
            commandId: new CommandId('cmd-2'),
        });

        // Replay twice with same events
        const result1 = AuditReplayer.replay({
            initialEqub: equb,
            events: [event1, event2],
        });

        const result2 = AuditReplayer.replay({
            initialEqub: equb,
            events: [event1, event2],
        });

        // Results should be identical
        const contrib1 = Array.from(result1.getContributions()).find((c) => c.id === 'c1');
        const contrib2 = Array.from(result2.getContributions()).find((c) => c.id === 'c1');

        expect(contrib1).toBeDefined();
        expect(contrib2).toBeDefined();
        expect(contrib1!.status).toBe(contrib2!.status);
        expect(contrib1!.reason).toBe(contrib2!.reason);
    });
});

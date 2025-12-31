/**
 * ABORT OBSERVABILITY TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/core/observability/abort_observability_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 4, Priority 14 (Application / Observability)
 * 
 * BUSINESS RULES VERIFIED:
 * - One Event Per Failure: Every domain abort must emit exactly one AbortEvent.
 * - Contextual Accuracy: AbortEvent must capture correct actorId, equbId, and commandId.
 * - Non-Invasive Safety: Failures in the observability layer must NOT interfere with domain logic.
 * - Anti-Retry: Observability must verify that no silent retries or recoveries are attempted.
 * - Truth Preservation: Domain errors must remain unchanged when observed; semantics are preserved.
 * - State Integrity: Replay and state mutation must halt immediately upon failure (abort-only).
 */

import { ContributionStatus, AllowedReaction, FailureSeverity } from '../../src/core/constants/enums';
import { DuplicateCommandError, CommandOrderingError } from '../../src/core/errors/domain_errors';
import { InMemoryAbortObserver } from '../../src/core/observability/in_memory_abort_observer';
import { AbortObserver } from '../../src/core/observability/abort_observer';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { EqubId } from '../../src/domain/value_objects/ids';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('Abort Observability Tests', () => {
    let equbRepository: MockEqubRepository;
    let auditRepository: MockAuditRepository;
    let abortObserver: InMemoryAbortObserver;
    let markUseCase: MarkContributionUseCase;

    beforeEach(() => {
        equbRepository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();
        abortObserver = new InMemoryAbortObserver();
        markUseCase = new MarkContributionUseCase(
            equbRepository,
            auditRepository,
            abortObserver
        );

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Abort emits exactly one AbortEvent', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const equbId = new EqubId('equb-1');

        // Execute first command
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId,
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Clear observer
        abortObserver.clear();

        // Try out-of-order command (same timestamp due to fake timers and no advance)
        // Commands must be strictly after, so same timestamp will fail with CommandOrderingError
        try {
            await markUseCase.execute({
                authContext,
                commandId: new CommandId('cmd-2'),
                equbId,
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            });
            fail('Should have thrown CommandOrderingError');
        } catch (e) {
            expect(e).toBeInstanceOf(CommandOrderingError);
        }

        // Verify exactly one AbortEvent was emitted
        expect(abortObserver.eventCount).toBe(1);
        const event = abortObserver.getLastEvent();
        expect(event).not.toBeNull();
        expect(event!.errorType).toBe('CommandOrderingError');
    });

    test('AbortEvent contains correct actorId / commandId', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const commandId = new CommandId('dup-cmd');
        const equbId = new EqubId('equb-1');

        // Execute first command
        await markUseCase.execute({
            authContext,
            commandId,
            equbId,
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        abortObserver.clear();

        // Try duplicate command (same commandId)
        try {
            await markUseCase.execute({
                authContext,
                commandId,
                equbId,
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            });
            fail('Should have thrown DuplicateCommandError');
        } catch (e) {
            expect(e).toBeInstanceOf(DuplicateCommandError);
        }

        // Verify AbortEvent context
        const event = abortObserver.getLastEvent();
        expect(event).not.toBeNull();
        expect(event!.actorId).toBe('collector-1');
        expect(event!.commandId).toBe('dup-cmd');
        expect(event!.equbId).toBe('equb-1');
        expect(event!.errorType).toBe('DuplicateCommandError');
    });

    test('AbortObserver failure does not affect abort behavior', async () => {
        const failingObserver: AbortObserver = {
            notify: jest.fn(() => { throw new Error('Observer Failure'); })
        };

        const useCase = new MarkContributionUseCase(
            equbRepository,
            auditRepository,
            failingObserver
        );

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Trigger an abort (e.g., attempt duplicate command)
        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-init'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // The abort (DuplicateCommandError) should still propagate even if observer fails
        await expect(useCase.execute({
            authContext,
            commandId: new CommandId('cmd-init'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.unpaid,
        })).rejects.toThrow(DuplicateCommandError);
    });

    test('No retries are triggered', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const commandId = new CommandId('cmd-1');

        await markUseCase.execute({
            authContext,
            commandId,
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        abortObserver.clear();

        // Try duplicate - should fail
        try {
            await markUseCase.execute({
                authContext,
                commandId,
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            });
        } catch (e) {
            // Error expected
        }

        // Event count should be exactly 1 (no silent retries)
        expect(abortObserver.eventCount).toBe(1);
    });

    test('Domain errors are unchanged', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const commandId = new CommandId('cmd-1');

        await markUseCase.execute({
            authContext,
            commandId,
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        try {
            await markUseCase.execute({
                authContext,
                commandId,
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            });
        } catch (error: any) {
            expect(error).toBeInstanceOf(DuplicateCommandError);
            expect(error.code).toBe('DUPLICATE_COMMAND');
            expect(error.severity).toBe(FailureSeverity.invariantViolation);
            expect(error.recoverable).toBe(false);
            expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
        }
    });

    test('Abort semantics remain abort-only', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        try {
            await markUseCase.execute({
                authContext,
                commandId: new CommandId('cmd-1'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            });
        } catch (error: any) {
            expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
            expect(error.recoverable).toBe(false);
        }

        // State remains unchanged from the successful mutation
        const contributions = await equbRepository.getContributions(new EqubId('equb-1'));
        const c2 = contributions.find((c) => c.id === 'c2');
        expect(c2!.status).toBe(ContributionStatus.paid);
    });
});

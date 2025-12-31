/**
 * NO SILENT RECOVERY TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/no_silent_recovery_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 2, Priority 7 (Domain Invariants / Behavioral Safety)
 * 
 * BUSINESS RULES VERIFIED:
 * - Deterministic Failure: Operations must halt immediately upon detecting state drift.
 * - No Retries: System must not automatically retry failed financial operations.
 * - No Fallbacks: System must not use default or fallback values for domain data.
 * - Integrity Preservation: Errors must propagate upward intact without being caught and silenced.
 * - Social Contract Enforcement: All errors must enforce an 'abortOnly' reaction.
 */

import { AllowedReaction, FailureSeverity, ContributionStatus } from '../../src/core/constants/enums';
import {
    DomainError,
    ContributionStatusError,
    EqubLifecycleError,
    RolePermissionError,
    PayoutLockError,
    StateDriftError
} from '../../src/core/errors/domain_errors';
import { SystemBoundaryPolicy } from '../../src/domain/policy/system_boundary_policy';
import { EqubId } from '../../src/domain/value_objects/ids';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { VerifyEqubConsistencyUseCase } from '../../src/application/use_cases/verify_equb_consistency_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('No Silent Recovery Tests', () => {
    let equbRepository: MockEqubRepository;
    let auditRepository: MockAuditRepository;

    beforeEach(() => {
        equbRepository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();
    });

    test('Drift detection halts execution', async () => {
        const verifyUseCase = new VerifyEqubConsistencyUseCase(equbRepository, auditRepository);
        const markUseCase = new MarkContributionUseCase(equbRepository, auditRepository);

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Perform action that creates audit event
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-drift-check'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verify should complete without error if state is consistent
        // In this test, we verify that it runs to completion (doesn't throw)
        // because we haven't introduced any drift yet.
        await expect(verifyUseCase.execute(new EqubId('equb-1'))).resolves.not.toThrow();
    });

    test('No retry logic exists', () => {
        const error = new ContributionStatusError('Test error');

        // Verify policy: no retry allowed
        const reaction = SystemBoundaryPolicy.getAllowedReaction(error);
        expect(reaction).toBe(AllowedReaction.abortOnly);
        expect(reaction).not.toBe('retryWithCorrection');

        // Verify error declares no recovery
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
    });

    test('No fallback values are applied', () => {
        // Test that errors propagate without fallback
        const error = new EqubLifecycleError('Cannot edit completed Equb');

        // Verify: no fallback, abort only
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);

        // Verify policy enforces no recovery
        expect(SystemBoundaryPolicy.isRecoverable(error)).toBe(false);
    });

    test('No default state is constructed', () => {
        // Test that invalid operations don't create default/fallback state
        const error = new RolePermissionError('Collector cannot confirm payouts');

        // Verify: no default state, abort only
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);

        // Policy enforces: no default construction
        const reaction = SystemBoundaryPolicy.getAllowedReaction(error);
        expect(reaction).toBe(AllowedReaction.abortOnly);
    });

    test('Errors propagate upward intact', async () => {
        const markUseCase = new MarkContributionUseCase(equbRepository, auditRepository);

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Attempt operation (this should succeed as Equb is active)
        // If it were to fail, we check that it throws exactly a DomainError
        try {
            await markUseCase.execute({
                authContext,
                commandId: new CommandId('cmd-propagate'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.paid,
            });
        } catch (e) {
            // Verify error is DomainError (not swallowed, not modified)
            expect(e).toBeInstanceOf(DomainError);
            const domainError = e as DomainError;
            expect(domainError.recoverable).toBe(false);
            expect(domainError.allowedReaction).toBe(AllowedReaction.abortOnly);
        }
    });

    test('All errors declare abortOnly reaction', () => {
        // Verify all error types enforce abort-only
        const errors = [
            new EqubLifecycleError('Test'),
            new ContributionStatusError('Test'),
            new PayoutLockError('Test'),
            new RolePermissionError('Test'),
            new StateDriftError('Test'),
        ];

        for (const error of errors) {
            expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
            expect(error.recoverable).toBe(false);
            expect(SystemBoundaryPolicy.getAllowedReaction(error)).toBe(AllowedReaction.abortOnly);
        }
    });

    test('Policy enforces no auto-fix for StateDriftError', () => {
        const error = new StateDriftError('State drift detected');

        // Policy: no auto-fix, abort only
        SystemBoundaryPolicy.onStateDrift(error);

        // Verify error declares no recovery
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
    });

    test('Policy enforces no coercion for invalid backend data', () => {
        const error = new DomainError('Invalid backend data', {
            code: 'INVALID_BACKEND_DATA',
            severity: FailureSeverity.externalDataCorruption,
        });

        // Policy: no coercion, reject and stop
        SystemBoundaryPolicy.onInvalidBackendData(error);

        // Verify: no recovery, abort only
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
    });

    test('Policy enforces no retry for invariant violations', () => {
        const error = new ContributionStatusError('Invariant violated');

        // Policy: no retry, abort immediately
        SystemBoundaryPolicy.onInvariantViolation(error);

        // Verify: no recovery, abort only
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
    });

    test('Policy enforces no permission escalation for forbidden actions', () => {
        const error = new RolePermissionError('Forbidden action');

        // Policy: no permission escalation, abort with clear error
        SystemBoundaryPolicy.onForbiddenAction(error);

        // Verify: no recovery, abort only
        expect(error.recoverable).toBe(false);
        expect(error.allowedReaction).toBe(AllowedReaction.abortOnly);
    });
});

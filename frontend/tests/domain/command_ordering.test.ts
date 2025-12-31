/**
 * COMMAND ORDERING & IDEMPOTENCY TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/domain/command_ordering_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 1, Priority 1 (CRITICAL - Financial Safety)
 * 
 * BUSINESS RULES VERIFIED:
 * - Idempotency: Duplicate CommandId must be rejected
 * - Strict Ordering: Commands must arrive in strictly increasing timestamp order
 * - No Equal Timestamps: Same timestamp is considered out of order
 * - State Immutability: Duplicate commands must NOT mutate state
 * - Audit Immutability: Duplicate commands must NOT emit duplicate audit events
 * - Chronological Audit: Audit log must maintain strict chronological order
 * - Replay Determinism: Commands must be linkable for state reconstruction
 * 
 * MIGRATION NOTES:
 * - Uses jest.useFakeTimers() for deterministic time behavior
 * - All command envelopes use AuthContext (not direct construction)
 * - Error types preserved exactly (DuplicateCommandError, CommandOrderingError)
 * - Test names preserved character-for-character from Dart
 */

import { ContributionStatus } from '../../src/core/constants/enums';
import { DuplicateCommandError, CommandOrderingError } from '../../src/core/errors/domain_errors';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { EqubId } from '../../src/domain/value_objects/ids';
import { MockAuditRepository } from '../../src/infrastructure/mock/mock_audit_repository';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

/**
 * Command Ordering & Idempotency Tests
 * 
 * CRITICAL: These tests verify financial correctness.
 * Any failure could lead to duplicate payouts or financial loss.
 */
describe('Command Ordering & Idempotency Tests', () => {
    let equbRepository: MockEqubRepository;
    let auditRepository: MockAuditRepository;
    let markUseCase: MarkContributionUseCase;

    /**
     * Setup: Initialize fresh state for each test
     * 
     * CRITICAL: Uses fake timers for deterministic time behavior
     */
    beforeEach(() => {
        // Initialize repositories (fresh state for each test)
        equbRepository = new MockEqubRepository();
        auditRepository = new MockAuditRepository();

        // Initialize use cases
        markUseCase = new MarkContributionUseCase(equbRepository, auditRepository);

        // CRITICAL: Enable fake timers for deterministic time behavior
        jest.useFakeTimers();
        // Set known base time (2025-01-01 00:00:00 UTC)
        jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    });

    /**
     * Teardown: Restore real timers
     */
    afterEach(() => {
        // CRITICAL: Restore real timers after each test
        jest.useRealTimers();
    });

    /**
     * TEST 1: Idempotency Verification
     * 
     * Dart source: lines 26-59
     * 
     * BUSINESS RULE: Same CommandId cannot be processed twice
     * 
     * Financial Impact: Prevents duplicate payouts/contributions
     */
    test('Same command twice → second fails (idempotency)', async () => {
        const commandId = new CommandId('cmd-1');

        // Create AuthContext
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // First execution succeeds
        await markUseCase.execute({
            authContext,
            commandId,
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Second execution with SAME commandId must fail
        await expect(
            markUseCase.execute({
                authContext,
                commandId, // Same CommandId!
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            })
        ).rejects.toThrow(DuplicateCommandError);
    });

    /**
     * TEST 2: Out-of-Order Command Rejection
     * 
     * Dart source: lines 61-97
     * 
     * BUSINESS RULE: Commands must be executed in strict timestamp order
     * 
     * Financial Impact: Prevents time-travel attacks and ensures deterministic replay
     */
    test('Commands out of order → fail (strict ordering)', async () => {
        const now = new Date(); // 2025-01-01T00:00:00.000Z (mocked)
        const later = new Date(now.getTime() + 10000); // +10 seconds

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute command with LATER timestamp first
        jest.setSystemTime(later);
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Try to execute command with EARLIER timestamp (out of order)
        jest.setSystemTime(now); // Go back in time
        await expect(
            markUseCase.execute({
                authContext,
                commandId: new CommandId('cmd-2'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            })
        ).rejects.toThrow(CommandOrderingError);
    });

    /**
     * TEST 3: In-Order Commands Succeed
     * 
     * Dart source: lines 99-151
     * 
     * BUSINESS RULE: Commands with strictly increasing timestamps succeed
     */
    test('Commands in order → succeed', async () => {
        const now = new Date();
        const later1 = new Date(now.getTime() + 5000); // +5 seconds
        const later2 = new Date(now.getTime() + 10000); // +10 seconds

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute first command (timestamp: now)
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Advance time to later1
        jest.setSystemTime(later1);

        // Execute second command (timestamp: later1)
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-2'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.unpaid,
        });

        // Advance time to later2
        jest.setSystemTime(later2);

        // Execute third command (timestamp: later2)
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-3'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // All commands succeeded (no exceptions thrown)
        expect(true).toBe(true); // Success indicator
    });

    /**
     * TEST 4: Same Timestamp Rejection
     * 
     * Dart source: lines 153-189
     * 
     * BUSINESS RULE: Commands with identical timestamps are rejected
     * (Strict ordering requires > not >=)
     */
    test('Same timestamp → second fails (strict ordering)', async () => {

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute first command
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Try to execute second command with SAME timestamp
        // System time hasn't advanced, so new Date() returns same timestamp
        await expect(
            markUseCase.execute({
                authContext,
                commandId: new CommandId('cmd-2'),
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            })
        ).rejects.toThrow(CommandOrderingError);
    });

    /**
     * TEST 5: Duplicate Command Does Not Mutate State
     * 
     * Dart source: lines 191-234
     * 
     * BUSINESS RULE: Duplicate commands must not change system state
     * 
     * Financial Impact: Ensures idempotency protects financial accuracy
     */
    test('Duplicate command does not mutate state', async () => {
        const commandId = new CommandId('cmd-1');

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // First execution: mark as paid
        await markUseCase.execute({
            authContext,
            commandId,
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verify state changed to paid
        const contributions1 = await equbRepository.getContributions(new EqubId('equb-1'));
        const contribution1 = contributions1.find(c => c.id === 'c2');
        expect(contribution1).toBeDefined();
        expect(contribution1!.status).toBe(ContributionStatus.paid);

        // Try duplicate command: mark as unpaid (should fail)
        await expect(
            markUseCase.execute({
                authContext,
                commandId, // Same CommandId
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            })
        ).rejects.toThrow(DuplicateCommandError);

        // Verify state did NOT change (still paid)
        const contributions2 = await equbRepository.getContributions(new EqubId('equb-1'));
        const contribution2 = contributions2.find(c => c.id === 'c2');
        expect(contribution2).toBeDefined();
        expect(contribution2!.status).toBe(ContributionStatus.paid); // Still paid!
    });

    /**
     * TEST 6: Duplicate Command Does Not Emit New Audit Events
     * 
     * Dart source: lines 236-279
     * 
     * BUSINESS RULE: Duplicate commands must not emit duplicate audit events
     * 
     * Audit Impact: Ensures audit log accuracy and replay determinism
     */
    test('Duplicate command does not emit new audit events', async () => {
        const commandId = new CommandId('cmd-1');

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // First execution
        await markUseCase.execute({
            authContext,
            commandId,
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Count audit events with this commandId
        const events1 = await auditRepository.getEvents(new EqubId('equb-1'));
        const eventsWithCommandId1 = events1.filter(e =>
            e.commandId?.value === commandId.value
        ).length;
        expect(eventsWithCommandId1).toBe(1);

        // Try duplicate command (should fail)
        await expect(
            markUseCase.execute({
                authContext,
                commandId, // Same CommandId
                equbId: new EqubId('equb-1'),
                contributionId: 'c2',
                status: ContributionStatus.unpaid,
            })
        ).rejects.toThrow(DuplicateCommandError);

        // Verify no new audit event was emitted
        const events2 = await auditRepository.getEvents(new EqubId('equb-1'));
        const eventsWithCommandId2 = events2.filter(e =>
            e.commandId?.value === commandId.value
        ).length;
        expect(eventsWithCommandId2).toBe(1); // Still only one event!
    });

    /**
     * TEST 7: Audit Remains Strictly Sequential
     * 
     * Dart source: lines 281-340
     * 
     * BUSINESS RULE: Audit events must be in chronological order
     * 
     * Replay Impact: Enables deterministic state reconstruction
     */
    test('Audit remains strictly sequential', async () => {
        const now = new Date();
        const later1 = new Date(now.getTime() + 5000); // +5 seconds
        const later2 = new Date(now.getTime() + 10000); // +10 seconds

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute first command
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Advance time and execute second command
        jest.setSystemTime(later1);
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-2'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.unpaid,
        });

        // Advance time and execute third command
        jest.setSystemTime(later2);
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-3'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Verify audit events are in chronological order
        const events = await auditRepository.getEvents(new EqubId('equb-1'));
        const contributionEvents = events
            .filter(e => e.targetId === 'c2')
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        expect(contributionEvents).toHaveLength(3);
        expect(contributionEvents[0].commandId?.value).toBe('cmd-1');
        expect(contributionEvents[1].commandId?.value).toBe('cmd-2');
        expect(contributionEvents[2].commandId?.value).toBe('cmd-3');
    });

    /**
     * TEST 8: Replay Works Deterministically
     * 
     * Dart source: lines 342-364
     * 
     * BUSINESS RULE: Audit events must be linkable to commands for replay
     */
    test('Replay still works deterministically', async () => {
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute command
        await markUseCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId: new EqubId('equb-1'),
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Get audit events
        const events = await auditRepository.getEvents(new EqubId('equb-1'));
        const contributionEvents = events.filter(e => e.targetId === 'c2');

        // Verify events are linked to commandId
        expect(contributionEvents.length).toBeGreaterThan(0);
        expect(contributionEvents[0].commandId?.value).toBe('cmd-1');
    });
});

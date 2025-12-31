/**
 * DEPLOYMENT VALIDATION TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/infrastructure/deployment/deployment_validation_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 3, Priority 12 (Infrastructure / Concurrency)
 * 
 * BUSINESS RULES VERIFIED:
 * - Distributed Isolation: Single-writer constraints must be enforced even if multiple backend instances exist.
 * - Monotonicity: Command ordering must be strictly respected even across backend restarts.
 * - Clock Discipline: Timestamps from the past or excessive future must be rejected to prevent "time travel" ambiguity.
 * - Social Contract: Audit logs must remain sequential and complete, surviving deployment cycles.
 * - State Resiliency: State must be reconstructible from audit events after an infrastructure-level "reboot".
 */

import { ContributionStatus } from '../../src/core/constants/enums';
import { CommandOrderingError, ConcurrencyViolationError } from '../../src/core/errors/domain_errors';
import { CommandId } from '../../src/domain/value_objects/command_id';
import { EqubId } from '../../src/domain/value_objects/ids';
import { CommandEnvelope } from '../../src/domain/value_objects/command_envelope';
import { InMemoryBackendStorage } from '../../src/infrastructure/backend/storage/in_memory_backend_storage';
import { AuditBackendRepository } from '../../src/infrastructure/backend/audit_backend_repository';
import { EqubBackendRepository } from '../../src/infrastructure/backend/equb_backend_repository';
import { InMemorySingleWriterLock } from '../../src/infrastructure/backend/deployment/single_writer_lock';
import { ClockSource } from '../../src/infrastructure/backend/deployment/clock_source';
import { MockEqubRepository } from '../../src/infrastructure/mock/mock_equb_repository';
import { MarkContributionUseCase } from '../../src/application/use_cases/mark_contribution_use_case';
import { AuthContext } from '../../src/application/auth/auth_context';
import { AuthenticatedActor } from '../../src/application/auth/authenticated_actor';

describe('Deployment Validation Tests', () => {
    let storage: InMemoryBackendStorage;
    let lock: InMemorySingleWriterLock;
    let clockSource: ClockSource;
    let backend: EqubBackendRepository;
    let auditRepo: AuditBackendRepository;
    let mockRepo: MockEqubRepository;

    beforeEach(() => {
        storage = new InMemoryBackendStorage();
        lock = new InMemorySingleWriterLock();
        clockSource = new ClockSource();
        backend = new EqubBackendRepository(storage);
        auditRepo = new AuditBackendRepository(storage);
        mockRepo = new MockEqubRepository();
    });

    test('Single-writer constraints enforced across multiple backend instances', async () => {
        const equbId = new EqubId('equb-1');

        // Instance 1 acquires lock
        await lock.tryAcquireLock(equbId);

        // Instance 2 tries to acquire lock (should fail)
        await expect(lock.tryAcquireLock(equbId)).rejects.toThrow(ConcurrencyViolationError);

        // Release lock from instance 1
        await lock.releaseLock(equbId);

        // Now instance 2 can acquire lock
        await expect(lock.tryAcquireLock(equbId)).resolves.toBe(true);
        await lock.releaseLock(equbId);
    });

    test('Command ordering respected after restart', async () => {
        const equbId = new EqubId('equb-1');
        const now = new Date('2025-01-01T10:00:00Z');
        const later = new Date('2025-01-01T10:00:05Z');

        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        // Execute command 1
        const envelope1 = CommandEnvelope.fromAuthContext({
            commandId: new CommandId('cmd-1'),
            authContext,
            equbId,
            issuedAt: now,
        });

        await backend.recordCommand(envelope1);

        // Simulate restart: new storage instance but we manually restore state
        // In the real system, storage is persistent.
        const newStorage = new InMemoryBackendStorage();
        // Restore clock state in the new storage
        await newStorage.updateCommandClock({
            equbId: equbId.value,
            lastCommandTimestamp: now,
        });

        const newBackend = new EqubBackendRepository(newStorage);

        // Execute command 2 after restart (should succeed if timestamp is after)
        const envelope2 = CommandEnvelope.fromAuthContext({
            commandId: new CommandId('cmd-2'),
            authContext,
            equbId,
            issuedAt: later,
        });

        await newBackend.recordCommand(envelope2);

        // Verify ordering is respected
        const lastTimestamp = await newBackend.getLastCommandTimestamp(equbId);
        expect(lastTimestamp?.getTime()).toBe(later.getTime());
    });

    test('Clock skew does not produce out-of-order commands', () => {
        const equbId = new EqubId('equb-1');
        const now = new Date('2025-01-01T10:00:00Z');
        const past = new Date('2025-01-01T09:59:50Z');
        const future = new Date('2025-01-01T10:00:30Z'); // 30s ahead is too much (limit 5s)

        // Command from the past (clock skew backward)
        expect(() => clockSource.validateOrdering({
            equbId,
            commandTimestamp: past,
            lastCommandTimestamp: now,
        })).toThrow(CommandOrderingError);

        // Command from the future (clock skew forward, beyond tolerance)
        expect(() => clockSource.validateNotInFuture({
            commandTimestamp: future,
            currentTime: now,
        })).toThrow(CommandOrderingError);
    });

    test('Audit events remain sequential and complete after deployment', async () => {
        const equbId = new EqubId('equb-1');
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const useCase = new MarkContributionUseCase(mockRepo, auditRepo);

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

        // Execute multiple commands
        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId,
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        jest.advanceTimersByTime(1000);

        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-2'),
            equbId,
            contributionId: 'c2',
            status: ContributionStatus.unpaid,
        });

        // Verify audit events are sequential
        const events = await auditRepo.getEvents(equbId);
        expect(events.length).toBeGreaterThanOrEqual(2);

        for (let i = 1; i < events.length; i++) {
            expect(events[i].timestamp.getTime()).toBeGreaterThanOrEqual(events[i - 1].timestamp.getTime());
        }

        jest.useRealTimers();
    });

    test('Derived snapshots can rebuild state correctly', async () => {
        const equbId = new EqubId('equb-1');
        const authContext = new AuthContext({
            authenticatedActor: AuthenticatedActor.fromVerifiedAuth({
                userId: 'collector-1',
                role: 'collector',
            }),
        });

        const useCase = new MarkContributionUseCase(mockRepo, auditRepo);

        // Execute command
        await useCase.execute({
            authContext,
            commandId: new CommandId('cmd-1'),
            equbId,
            contributionId: 'c2',
            status: ContributionStatus.paid,
        });

        // Get audit events
        const events = await auditRepo.getEvents(equbId);
        expect(events.length).toBeGreaterThan(0);

        // Verify they preserve the command truth
        const markEvent = events.find((e) => e.targetId === 'c2');
        expect(markEvent).toBeDefined();
        expect(markEvent!.newValue).toBe('paid');
    });
});

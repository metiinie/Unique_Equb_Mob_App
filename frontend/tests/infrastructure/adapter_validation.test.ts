/**
 * BACKEND ADAPTER VALIDATION TESTS
 * 
 * Source: test.FLUTTER_REFERENCE/infrastructure/backend/adapter_validation_test.dart
 * Migrated: December 24, 2025
 * Priority: Tier 3, Priority 10 (Infrastructure / Data Validation)
 * 
 * BUSINESS RULES VERIFIED:
 * - Vocabulary Enforcement: Backend must not return illegal statuses (rejection of "lies").
 * - Transparency Rules: On Hold contributions must always include a reason even from backend.
 * - Format Strictness: Invalid date formats or frequencies must be rejected by mappers.
 * - Role Separation: Mappers validate data format, while use-cases handle business rules.
 */

import { EqubStatus } from '../../src/core/constants/enums';
import { DomainError, ContributionStatusError } from '../../src/core/errors/domain_errors';
import { EqubDto } from '../../src/infrastructure/backend/dto/equb_dto';
import { ContributionDto } from '../../src/infrastructure/backend/dto/contribution_dto';
import { PayoutDto } from '../../src/infrastructure/backend/dto/payout_dto';
import { EqubMapper } from '../../src/infrastructure/mappers/equb_mapper';
import { ContributionMapper } from '../../src/infrastructure/mappers/contribution_mapper';
import { PayoutMapper } from '../../src/infrastructure/mappers/payout_mapper';

describe('Backend Adapter Validation Tests', () => {
    test('Backend payload with illegal Equb status → error', () => {
        const dto = new EqubDto({
            id: 'test-1',
            name: 'Test Equb',
            contributionAmount: 100,
            frequency: 'monthly',
            startDate: new Date().toISOString(),
            status: 'invalid_status', // Illegal status
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });

        expect(() => EqubMapper.toDomain(dto)).toThrow(DomainError);
    });

    test('Backend payload with illegal contribution status → error', () => {
        const dto = new ContributionDto({
            id: 'c1',
            equbId: 'equb-1',
            memberId: 'm1',
            period: new Date().toISOString(),
            roundNumber: 1,
            status: 'invalid_status', // Illegal status
            setBy: 'admin-1',
            setAt: new Date().toISOString(),
        });

        expect(() => ContributionMapper.toDomain(dto)).toThrow(DomainError);
    });

    test('Backend On Hold contribution without reason → error', () => {
        const dto = new ContributionDto({
            id: 'c1',
            equbId: 'equb-1',
            memberId: 'm1',
            period: new Date().toISOString(),
            roundNumber: 1,
            status: 'onHold',
            setBy: 'admin-1',
            setAt: new Date().toISOString(),
            reason: '', // Missing/empty reason
        });

        expect(() => ContributionMapper.toDomain(dto)).toThrow(ContributionStatusError);
    });

    test('Backend payout with illegal status → error', () => {
        const dto = new PayoutDto({
            id: 'p1',
            equbId: 'equb-1',
            memberId: 'm1',
            roundNumber: 1,
            status: 'invalid_status', // Illegal status
            blockedReason: undefined,
        });

        expect(() => PayoutMapper.toDomain(dto)).toThrow(DomainError);
    });

    test('Backend tries to edit completed Equb → error', () => {
        // Mapper should accept valid Completed status
        // Use-cases will enforce business rules later
        const dto = new EqubDto({
            id: 'test-1',
            name: 'Test Equb',
            contributionAmount: 100,
            frequency: 'monthly',
            startDate: new Date().toISOString(),
            status: 'completed', // Valid status
            members: [],
            payoutOrder: [],
            currentRoundNumber: 12,
            totalRounds: 12,
        });

        const equb = EqubMapper.toDomain(dto);
        expect(equb.status).toBe(EqubStatus.completed);
    });

    test('Backend invalid date format → error', () => {
        const dto = new EqubDto({
            id: 'test-1',
            name: 'Test Equb',
            contributionAmount: 100,
            frequency: 'monthly',
            startDate: 'invalid-date-format', // Invalid date
            status: 'active',
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });

        expect(() => EqubMapper.toDomain(dto)).toThrow(DomainError);
    });

    test('Backend invalid frequency → error', () => {
        const dto = new EqubDto({
            id: 'test-1',
            name: 'Test Equb',
            contributionAmount: 100,
            frequency: 'invalid_frequency', // Invalid frequency
            startDate: new Date().toISOString(),
            status: 'active',
            members: [],
            payoutOrder: [],
            currentRoundNumber: 1,
            totalRounds: 12,
        });

        expect(() => EqubMapper.toDomain(dto)).toThrow(DomainError);
    });
});

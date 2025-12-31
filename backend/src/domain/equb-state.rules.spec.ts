import { ConflictException } from '@nestjs/common';
import { EqubStatus } from '@prisma/client';
import {
    assertCanActivate,
    assertCanContribute,
    assertCanExecutePayout,
    assertNotCompleted
} from './equb-state.rules';

describe('EqubState Machine Rules', () => {
    const mockEqub = (status: EqubStatus, currentRound = 1, totalRounds = 10) => ({
        id: 'test-equb',
        status,
        currentRound,
        totalRounds,
    }) as any;

    describe('assertCanActivate', () => {
        it('should allow DRAFT to activate', () => {
            expect(() => assertCanActivate(mockEqub(EqubStatus.DRAFT))).not.toThrow();
        });

        it('should throw for ACTIVE', () => {
            expect(() => assertCanActivate(mockEqub(EqubStatus.ACTIVE)))
                .toThrow(ConflictException);
        });

        it('should throw for COMPLETED', () => {
            expect(() => assertCanActivate(mockEqub(EqubStatus.COMPLETED)))
                .toThrow(ConflictException);
        });
    });

    describe('assertCanContribute', () => {
        it('should allow ACTIVE to contribute', () => {
            expect(() => assertCanContribute(mockEqub(EqubStatus.ACTIVE))).not.toThrow();
        });

        it('should throw for DRAFT', () => {
            expect(() => assertCanContribute(mockEqub(EqubStatus.DRAFT)))
                .toThrow(ConflictException);
        });

        it('should throw for COMPLETED', () => {
            expect(() => assertCanContribute(mockEqub(EqubStatus.COMPLETED)))
                .toThrow(ConflictException);
        });
    });

    describe('assertCanExecutePayout', () => {
        it('should allow ACTIVE to execute payout', () => {
            expect(() => assertCanExecutePayout(mockEqub(EqubStatus.ACTIVE))).not.toThrow();
        });

        it('should throw for DRAFT', () => {
            expect(() => assertCanExecutePayout(mockEqub(EqubStatus.DRAFT)))
                .toThrow(ConflictException);
        });

        it('should throw if current round > total rounds', () => {
            expect(() => assertCanExecutePayout(mockEqub(EqubStatus.ACTIVE, 11, 10)))
                .toThrow(ConflictException);
        });
    });

    describe('assertNotCompleted', () => {
        it('should allow ACTIVE', () => {
            expect(() => assertNotCompleted(mockEqub(EqubStatus.ACTIVE))).not.toThrow();
        });

        it('should allow DRAFT', () => {
            expect(() => assertNotCompleted(mockEqub(EqubStatus.DRAFT))).not.toThrow();
        });

        it('should throw for COMPLETED', () => {
            expect(() => assertNotCompleted(mockEqub(EqubStatus.COMPLETED)))
                .toThrow(ConflictException);
        });
    });
});

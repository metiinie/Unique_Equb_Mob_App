import { ConflictException } from '@nestjs/common';
import { Equb, EqubStatus } from '@prisma/client';

/**
 * Domain-driven State Machine for Equb lifecycle.
 * Centralizes all business rules regarding state transitions and allowed operations.
 */

/**
 * Asserts that the Equb can be activated (DRAFT -> ACTIVE).
 * Only DRAFT Equbs with required members/setup can be activated.
 */
export function assertCanActivate(equb: Equb): void {
    if (equb.status !== EqubStatus.ACTIVE && equb.status !== EqubStatus.DRAFT) {
        // In case we add more states, but usually it's DRAFT -> ACTIVE
    }
    if (equb.status !== EqubStatus.DRAFT) {
        throw new ConflictException(`Cannot activate Equb: Current status is ${equb.status}. Only DRAFT Equbs can be activated.`);
    }
}

/**
 * Asserts that contributions can be created or managed for this Equb.
 * Contributions are only allowed in ACTIVE state.
 */
export function assertCanContribute(equb: Equb): void {
    if (equb.status === EqubStatus.DRAFT) {
        throw new ConflictException('Equb is still in DRAFT. Contributions are not allowed until it is ACTIVE.');
    }
    if (equb.status === EqubStatus.COMPLETED) {
        throw new ConflictException('Equb is COMPLETED. No further contributions are allowed.');
    }
    if (equb.status !== EqubStatus.ACTIVE) {
        throw new ConflictException(`Invalid state for contribution: ${equb.status}`);
    }
}

/**
 * Asserts that a payout can be executed for this Equb.
 */
export function assertCanExecutePayout(equb: Equb): void {
    if (equb.status !== EqubStatus.ACTIVE) {
        throw new ConflictException(
            `Cannot execute payout: Equb status is ${equb.status}. Only ACTIVE Equbs can process payouts.`
        );
    }

    if (equb.currentRound > equb.totalRounds) {
        throw new ConflictException('All rounds completed: Cannot execute payout beyond total rounds');
    }
}

/**
 * Asserts that the Equb is ACTIVE.
 */
export function assertActive(equb: Equb): void {
    if (equb.status !== EqubStatus.ACTIVE) {
        throw new ConflictException(`Operation requires ACTIVE status. Current status: ${equb.status}`);
    }
}

/**
 * Asserts that the Equb is ON_HOLD.
 */
export function assertOnHold(equb: Equb): void {
    if (equb.status !== EqubStatus.ON_HOLD) {
        throw new ConflictException(`Operation requires ON_HOLD status. Current status: ${equb.status}`);
    }
}

/**
 * Asserts that the Equb is not in a terminal state (COMPLETED or TERMINATED).
 * Used for generic mutations.
 */
export function assertNotCompleted(equb: Equb): void {
    const terminalStates: EqubStatus[] = [EqubStatus.COMPLETED, EqubStatus.TERMINATED];
    if (terminalStates.includes(equb.status)) {
        throw new ConflictException(`Operation denied: This Equb is in terminal state '${equb.status}' and is now read-only.`);
    }
}

/**
 * Asserts that the Equb has reached its terminal state.
 */
export function assertTerminalState(equb: Equb): void {
    const terminalStates: EqubStatus[] = [EqubStatus.COMPLETED, EqubStatus.TERMINATED];
    if (!terminalStates.includes(equb.status)) {
        throw new ConflictException(`Equb is not in terminal state. Current status: ${equb.status}`);
    }
}

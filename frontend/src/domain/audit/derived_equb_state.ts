import { Contribution } from '../entities/contribution';
import { Equb } from '../entities/equb';
import { Payout } from '../entities/payout';

/**
 * State derived from replaying audit events.
 * 
 * This is a read-only snapshot used for verification.
 * It represents what the state SHOULD be based on audit history.
 * 
 * This aligns with principle: "The audit log is the source of truth"
 */
export class DerivedEqubState {
  public readonly equb: Equb;
  public readonly contributions: Map<string, Contribution>; // contributionId -> Contribution
  public readonly payouts: Map<string, Payout>; // payoutId -> Payout

  constructor({
    equb,
    contributions,
    payouts,
  }: {
    equb: Equb;
    contributions: Map<string, Contribution>;
    payouts: Map<string, Payout>;
  }) {
    this.equb = equb;
    this.contributions = contributions;
    this.payouts = payouts;
  }

  /** Gets all contributions as a list. */
  getContributions(): Contribution[] {
    return Array.from(this.contributions.values());
  }

  /** Gets all payouts as a list. */
  getPayouts(): Payout[] {
    return Array.from(this.payouts.values());
  }
}

# Equb System - Financial Invariants & Governance

This document defines the **Executable Invariants** that govern the Equb financial system.  
Any change to the system MUST maintain these invariants. Violations are considered critical failures.

---

## 1. Contribution Invariants

| Invariant | Description | Enforcing Service | Verification Test |
|:---|:---|:---|:---|
| **Member Role Only** | Only users with `MEMBER` role can contribute. | `ContributionService.createContribution` | `contribution.service.spec.ts` |
| **Active Membership** | User must be an `ACTIVE` member of the specific Equb. | `ContributionService.createContribution` | `contribution.service.spec.ts` |
| **Exact Amount** | Contribution amount must strictly equal `equb.amount`. | `ContributionService.createContribution` | `contribution.service.spec.ts` |
| **Round Alignment** | Contribution must be for `equb.currentRound`. | `ContributionService.createContribution` | `contribution.service.spec.ts` |
| **One Per Round** | A member can only contribute ONCE per round (DB Unique Constraint). | `ContributionService.createContribution` | `contribution.service.spec.ts` |
| **Immutable Ledger** | Contributions are append-only. No updates/deletes except status transitions. | `Prisma Schema` | `schema.prisma` |

## 2. Payout Invariants

| Invariant | Description | Enforcing Service | Verification Test |
|:---|:---|:---|:---|
| **Admin/Collector Only** | Only `ADMIN` or assigned `COLLECTOR` can execute payouts. | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Full Funding** | Payout cannot occur until ALL active members have `CONFIRMED` contributions. | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Recipient Uniqueness** | A member receives a payout exactly once per cycle (Rotation). | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Deterministic Order** | Recipient selection is deterministic (Join Date + User ID). | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **One Payout Per Round** | Only one payout record can exist for a given (Equb, Round). | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Atomic Transaction** | Payout Record + Contribution Settlement + Round Advancement occur atomically. | `PayoutService.executePayout` | `payout.service.spec.ts` |

## 3. Financial Reconciliation Updates

| Invariant | Description | Enforcing Service | Verification Test |
|:---|:---|:---|:---|
| **Zero-Sum** | `Payout Amount` MUST equal `SUM(Settled Contributions)`. | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Count Integrity** | `Settled Count` MUST equal `Expected Member Count`. | `PayoutService.executePayout` | `payout.service.spec.ts` |
| **Settlement Status** | Contributions transition to `SETTLED` only after successful payout. | `PayoutService.executePayout` | `payout.service.spec.ts` |

## 4. Audit Guarantees

| Invariant | Description | Enforcing Service | Verification Test |
|:---|:---|:---|:---|
| **Immutable Logs** | Audit events are read-only and never deleted. | `AuditEventService` | `audit-event.service.spec.ts` |
| **Complete Timeline** | Every write operation emits a corresponding audit event. | All Services | Service Specs |
| **Snapshotting** | Critical events (`ROUND_CLOSED`) include a data snapshot. | `PayoutService` | `payout.service.spec.ts` |

---

## 5. Dangerous Operations Registry

These operations modify core financial state and require elevated privileges.

| Operation | Role Required | Audit Event | Impact |
|:---|:---|:---|:---|
| `executePayout` | ADMIN, COLLECTOR | `PAYOUT_COMPLETED`, `ROUND_CLOSED`, `CONTRIBUTION_SETTLED` | Settles funds, moves money, advances round. |
| `forceCompleteEqub` | ADMIN | `EQUB_COMPLETED` | Permanently closes an Equb. |
| `integrityCheck` | ADMIN | N/A (Read-Only) | Heavy read operation across full history. |

---

## 6. Core Freeze Declaration

The following modules are declared **FROZEN** as of Phase 5.  
Changes to these files require extensive regression testing and a migration plan.

- `src/modules/contribution/contribution.service.ts`
- `src/modules/payout/payout.service.ts`
- `src/modules/reporting/financial-metrics.service.ts`
- `prisma/schema.prisma` (Financial Models)

---

**Last Verified**: 2026-01-02  
**Status**: ENFORCED

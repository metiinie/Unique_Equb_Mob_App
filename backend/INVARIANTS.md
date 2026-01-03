# System Invariants & Governance

> **FROZEN CORE**: The subsystems listed here are critical to financial integrity. Changes require strict adherence to the Governance Protocol.

## 1. Governance Protocol

### Change Classification Policy (Phase 9)
All changes to the codebase MUST be classified:

*   **🟢 SAFE**: UI tweaks, copy changes, read-only dashboard enhancements.
    *   *Process*: Standard PR review.
*   **🟡 SENSITIVE**: Query optimizations, reporting logic, new read-only endpoints in financial modules.
    *   *Process*: PR review + Integrity Check verification in staging.
*   **🔴 CRITICAL**: Changes to `ContributionService`, `PayoutService`, `FinancialMetricsService`, `schema.prisma` (financial tables), or `INVARIANTS.md`.
    *   *Process*:
        1.  Major Version Bump (x.0.0).
        2.  Update `INVARIANTS.md` if rules change.
        3.  Pass `regression.spec.ts`.
        4.  Deploy with "Degraded Mode" rollback plan.

## 2. Financial Invariants (Executable)

### Contribution Flow
*   **C1**: A contribution cannot be created for a non-existent Equb.
*   **C2**: A contribution cannot be created if the round is not current.
*   **C3**: A contribution amount must match `equb.amount`.
*   **C4**: Duplicate confirmed contributions for the same round/member are impossible (DB Unique Constraint).

### Payout Execution
*   **P1**: A payout can ONLY occur if the round is fully funded (Confirmed Contributions == Member Count).
*   **P2**: A payout amount must EXACTLY equal `equb.amount * memberCount`.
*   **P3**: Only one payout per round is allowed.
*   **P4**: Payout Recipient logic must be deterministic (Rotational or Lottery).
*   **P5**: Execution must be Atomic: (Create Payout + Settle Contributions + Advance Round + Audit) in one Transaction.

### Round Lifecycle
*   **R1**: A round cannot advance until Payout is executed.
*   **R2**: `equb.currentRound` must never exceed `equb.totalRounds`.
*   **R3**: Equb status transitions from ACTIVE -> COMPLETED only when final round payout is executed.

### Audit & Compliance
*   **A1**: Every financial write (Contribution, Payout) MUST generate an Audit Log.
*   **A2**: Audit Logs are immutable (Appended only).
*   **A3**: System Version must be logged with every event.

## 3. Dangerous Operations Registry

| Operation | Role Required | Safety Gate | Audit Type |
| :--- | :--- | :--- | :--- |
| `executePayout` | ADMIN/COLLECTOR | `checkPayoutEligibility` (Precheck) | `PAYOUT_COMPLETED` |
| `integrityCheck` | ADMIN | N/A | `INTEGRITY_CHECK` |
| `confirmContribution` | ADMIN/COLLECTOR | N/A | `CONTRIBUTION_CONFIRMED` |
| `rejectContribution` | ADMIN/COLLECTOR | N/A | `CONTRIBUTION_REJECTED` |

## 4. Operational Degradation (Kill Switch)
If the system detects an integrity violation (e.g., Ledger Mismatch):
1.  System enters `DEGRADED` mode.
2.  All `FINANCIAL_WRITE` endpoints (`@FinancialWrite`) are BLOCKED (503 Service Unavailable).
3.  `READ_ONLY` endpoints remain serving.
4.  Operators must perform manual reconciliation before resetting.

# Integration Verification: Step 3 — Contribution & Payout

This document outlines the steps to verify the humble Contribution Capture, Management, and Payout flow.

## 1. Automated Unit Tests
Run the following command:
```bash
cd frontend
npm test tests/presentation/contribution_flow.test.ts
```

## 2. Manual Integration Flow (Dev Environment)

### Flow A: Member Contribution
1. **Login** as a `MEMBER`.
2. **Navigate** to an active Equb.
3. **Action**: Tap "Make Contribution".
4. **Result**: `ContributionCaptureScreen` displays the current round and amount from the backend.
5. **Action**: Tap "Submit Contribution".
6. **Intent**: Backend `POST /api/v1/equbs/:id/contribute` is called.
7. **Success**: "Contribution created successfully" alert; navigate back.
8. **Double-Spend**: Try to contribute again. Verify backend returns `409 Conflict` and frontend displays the error alert.

### Flow B: Collector Approval
1. **Login** as a `COLLECTOR` or `ADMIN`.
2. **Navigate** to the same Equb.
3. **Action**: Tap "Review Pending".
4. **Behavior**: `ContributionManagementScreen` lists all `PENDING` contributions.
5. **Action**: Tap "Confirm" on a contribution.
6. **Intent**: Backend `POST /api/v1/contributions/:id/confirm` is called.
7. **Result**: Contribution disappears from the pending list.

### Flow C: Admin Payout
1. **Login** as an `ADMIN`.
2. **Navigate** to the Equb.
3. **Action**: Tap "Execute Payout".
4. **Behavior**: `PayoutInitiationScreen` displays pool summary.
5. **Action**: Tap "Execute Round Payout" and confirm the double-check dialog.
6. **Scenario 1 (Failure)**: If some members haven't paid, verify backend returns `400 Bad Request` "Contributions incomplete" and frontend shows an alert.
7. **Scenario 2 (Success)**: If all contributions are confirmed, verify round increments and payout is recorded in the ledger.

## 3. Lawful Constraints Verified
- [x] **No Local Validation**: Frontend does not check if the user is a member of the Equb; the backend does.
- [x] **Atomic Payouts**: Payout execution is a single intent to the backend.
- [x] **Humble UI**: Feedback is provided via direct backend error messages.

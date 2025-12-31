# Integration Verification: Step 4 — Audit & Completion

This document outlines the steps to verify the Audit Trail, Final Payout, and Equb Completion flow.

## 1. Automated Unit Tests
Run the following command:
```bash
cd frontend
npx jest tests/presentation/audit_completion_flow.test.ts
```

## 2. Manual Integration Flow (Dev Environment)

### Flow A: Audit Trail Verification
1. **Login** as any role (MEMBER, COLLECTOR, ADMIN).
2. **Navigate** to an active or completed Equb.
3. **Action**: Tap on "📜 Audit Trail" in the secondary actions.
4. **Behavior**: `AuditTrailScreen` displays a chronological list of events.
5. **Transparency**: Verify that events like `EQUB_ACTIVATED`, `CONTRIBUTION_CONFIRMED`, and `PAYOUT_COMPLETED` are visible with their associated actor IDs.

### Flow B: Latest Payout Summary
1. **Action**: From the Equb Overview, tap "💰 Latest Payout".
2. **Behavior**: `FinalPayoutScreen` displays the summary of the most recently executed round.
3. **Role Check**: 
    - If logged in as **MEMBER**, verify you only see the latest payout if YOU were the recipient (as per backend logic).
    - If logged in as **ADMIN**, verify you see the payout details regardless of recipient.
4. **Failure Case**: If no rounds have been executed, verify the screen shows "No payouts executed yet."

### Flow C: Equb Completion Record
1. **Setup**: An Equb must reach `COMPLETED` status (all rounds paid out).
2. **Action**: Open a completed Equb from the Equb Selection list.
3. **Behavior**: The Overview screen should now show a green "View Completion Record" button.
4. **Action**: Tap "View Completion Record".
5. **Transparency**: `EqubCompletionScreen` displays a read-only final summary of all rounds and the audit trail hash.

## 3. Lawful Constraints Verified
- [x] **Strictly Read-Only**: No buttons to "Edit" or "Modify" appear on these screens.
- [x] **Backend Contract**: Every data point displayed is a direct 1:1 reflection of the DTOs returned by the API.
- [x] **No Decision Logic**: The frontend does not verify if the audit log is "valid"; it simply displays what the server provides as the source of truth.

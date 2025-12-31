# Integration Verification: Step 2 — Equb Selection & Overview

This document outlines the steps to verify the humble Equb Selection and Overview flow.

## 1. Automated Unit Tests
Run the following command:
```bash
cd frontend
npm test tests/presentation/equb_flow.test.ts
```

## 2. Manual Integration Flow (Dev Environment)

### Flow A: List Equbs
1. **Action**: Login and navigate to the Home tab.
2. **Behavior**: `EqubSelectionScreen` shows a loading indicator.
3. **Intent**: Backend `GET /api/v1/equbs` is called.
4. **Result**: A list of Equbs is displayed. Verify that the statuses (ACTIVE, ON_HOLD, etc.) match the backend exactly.

### Flow B: Drill Down to Details
1. **Action**: Tap on an Equb card in the list.
2. **Behavior**: App navigates to `EqubOverview`.
3. **Intent**: Backend `GET /api/v1/equbs/:id`, `GET /api/v1/equbs/:id/contributions`, and `GET /api/v1/equbs/:id/payouts` are called in parallel.
4. **Result**: Equb details, contribution history (filtered by role), and payout schedule are displayed.

### Flow C: Role-Based Content
1. **Action**: Login as `ADMIN`.
2. **Behavior**: Navigate to a specific Equb.
3. **Result**: Verify the "Administrative Summary" section is visible.
4. **Action**: Login as `MEMBER`.
5. **Result**: Verify the "Administrative Summary" section is hidden.

### Flow D: Status-Based Actions
1. **Action**: Open an Equb that is `TERMINATED` or `COMPLETED`.
2. **Result**: Verify that the "Mark Contribution" button is hidden (or disabled if the backend says so).

## 3. Lawful Constraints Verified
- [x] **No Local State**: Screens fetch fresh data from the backend on mount.
- [x] **Enum Casing**: UI displays `ACTIVE` and `CONFIRMED` exactly as sent by the backend.
- [x] **Thin Component**: The screen has zero logic for deciding if a payout is valid; it simply renders what the backend returns.

# NOTIFICATIONS & ALERTS - PHASE 4 PLAN

## 🎯 Objective
Implement a read-only, event-driven notification layer that transforms immutable ledger records into actionable user alerts and dashboard indicators.

## 🔒 Foundation Freeze Compliance
- **Read-Only Backend:** All notification data is derived via `GET` requests.
- **Ledger Integrity:** No modification of `Contribution`, `Payout`, or `Equb` records.
- **Audit Traceability:** Every notification includes a `sourceId` pointing to the underlying ground truth.

## 🛠️ Implementation Strategy

### 1. Backend: Derived Notification Service
- Create `NotificationService` to scan for:
    - **Pending Contributions:** Cross-reference active memberships with current rounds for missing `CONFIRMED` contributions.
    - **Received Payouts:** List historical `EXECUTED` payouts for members.
    - **Round Progress:** Extract recent "ROUND_PROGRESSED" audit events for Admins.
    - **Audit Alerts:** Detect anomalies (mocked for now, but wired for future logic).

### 2. Frontend: Notification Architecture
- **Global Context:** `NotificationProvider` to fetch and store alerts, shared across all screens.
- **Smart Polling:** Implement a 60-second background refresh to simulate real-time updates safely.
- **Role-Based Filtering:**
    - **Members:** Personalized alerts for their own finances.
    - **Admin/Collector:** Global system events and round status.

### 3. UI/UX: Actionable Indicators
- **Notification Center:** A dedicated hub for historical alerts with category filters.
- **Hero Alerts:** Immediate action cards on the Home screen for urgent tasks (e.g., "Pay Contribution").
- **Badge Integration:** Header icons with navigation to the central alert hub.

## ✅ Verification Plan
- [ ] Member sees only their pending contributions.
- [ ] Admin sees global round completion logs.
- [ ] Navigation from "Action Required" card leads to correct payment screen.
- [ ] Polling refreshes data without UI flicker.

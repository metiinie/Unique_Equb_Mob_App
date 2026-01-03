# Role Transition & Replacement Scenarios
## Strategy: Deterministic Sovereignty

In the Unique Equb System, roles are immutable once assigned to a round, but transitions between rounds are permitted via Admin-only governance.

### 1. Collector Replacement
**Scenario**: A Collector is unavailable or compromised.
- **Protocol**: 
  1. Admin suspends existing Collector membership (`POST /memberships/equbs/:id/members/:userId/suspend`).
  2. Admin assigns a new user as Collector OR promotes an existing Member (`POST /memberships/equbs/:id/members/:userId/role`).
  3. All pending contributions for the *current* round are reassigned to the new Collector's oversight.
  4. Audit log captures `COLLECTOR_REPLACED` event with reason.

### 2. Member Default & Seat Replacement
**Scenario**: A member fails to contribute for X rounds (Legacy/Risk).
- **Protocol**:
  1. Admin sets member status to `SUSPENDED` via API.
  2. Payouts for this seat are BLOCKED by the eligibility engine.
  3. **Replacement**: A new user can be "swapped" into the seat. 
  4. The system recalibrates the rotation to ensure the new user does not receive double payouts or bypass the queue.

### 3. Role Escalation
- **Protocol**: 
  - A Member can be promoted to Collector. 
  - They retain their "Member" seat for payouts but gain "Collector" capabilities for oversight. 
  - The system tracks `actorRole` in audit logs to distinguish between "Member" actions and "Collector" actions.

# Disaster Recovery & Integrity Rebuild Tooling
## Objective: Recovery from Divergence

The system is designed with an "Audit-First" architecture, meaning the Database is a projection of the Audit Trail.

### 1. Ledger Replay Utility (`RECONSTRUCT_ENGINE`)
- **API Endpoint**: `GET /system/integrity/drift/:equbId`
- **Function**: Replays the `AuditEvents` table in chronological order (`timestamp` + `seqId`) and reconstructs the "True State" of an Equb, comparing it against relational tables.
- **Logic**: 
  - If drift is detected, the system flags the Equb as `INTEGRITY_COMPROMISED`.
  - Reconstruction is the "Source of Truth" in case of relational data drift.

### 2. Financial Integrity Verifier (`fin-check`)
- **Function**: Automatically cross-references ALL confirmed contributions against ALL executed payouts per Equb.
- **Rules**:
  - `SUM(contributions)` MUST EQUAL `SUM(payouts)` modulo current round state.
  - No user can have > 1 payout per seat.
  - No round can have > memberCount contributions.

### 3. State Forced Reset (Disaster Only)
- **Function**: Allows Admin to manually force an Equb from `TERMINATED` or `ON_HOLD` back to `ACTIVE` by injecting a `RECOVERY_OVERRIDE` audit event.
- **Guard**: This action generates a `CRITICAL` audit alert visible to all system admins.

### 4. Database Snapshot Protocol
- **Interval**: Daily WAL-G backups to S3-compatible storage.
- **RPO**: 5 minutes.
- **RTO**: 15 minutes to full API availability.

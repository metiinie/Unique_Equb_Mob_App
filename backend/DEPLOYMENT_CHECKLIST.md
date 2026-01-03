# Deployment Checklist

Phase 9: Production Discipline & Change Control requires that every deployment adheres to this checklist.

## 1. Release Identity
- [ ] **SemVer Updated**: Is `package.json` version bumped? (Major for critical changes, Minor for features, Patch for fixes)
- [ ] **Git Tagged**: Is the commit tagged with the release version?
- [ ] **Release Notes**: Are changes documented in `CHANGELOG.md`?

## 2. Integrity & Safety
- [ ] **Invariants Verified**: Do all changes respect `INVARIANTS.md`?
- [ ] **Schema Compatibility**: Does `npx prisma migrate status` show clean state?
- [ ] **Tests Passed**: `npm run test` (Unit) and `npm run test:e2e` (E2E)?
- [ ] **Regression Suite**: `backend/src/modules/reporting/regression.spec.ts` passes?

## 3. Migration Review
- [ ] **Migration Script**: Is there a new migration? Is it non-destructive?
- [ ] **Data Safety**: Does it involve financial tables (Contribution, Payout)? If so, has it been reviewed by 2 seniors?

## 4. Audit & Compliance
- [ ] **Audit Schema**: Are `AuditActionType` enums up to date?
- [ ] **Version Log**: Does `AuditEvent` schema include `systemVersion`?
- [ ] **Degradation Plan**: Do we have a plan if the system starts in `DEGRADED` mode?

## 5. Post-Deployment Verification
- [ ] **Version Endpoint**: `GET /system/version` returns expected version?
- [ ] **Integrity Check**: `GET /system/integrity-check` returns `OK`?
- [ ] **Audit Verification**: Perform a benign action and verify it appears in `GET /audit-events` with correct version.

---
**Signed By:** ____________________
**Date:** ____________________

# Known Limitations & Pilot Constraints
## Phase 10: Pilot Release Note

This document tracks known limitations for the internal pilot of the Unique Equb System.

### 1. Financial Limitations
- **Currency Support**: Currently hardcoded to `ETB`. Multi-currency support is pending Phase 11.
- **Micro-Payments**: Amounts below 1.00 unit are not supported due to Decimal precision guardrails.
- **Manual Settlement**: The system assumes "Cash-in-Hand" or external banking. Direct bank API integration (Telebirr, CBE) is not implemented.

### 2. Operational Limitations
- **Round Advancement**: Round advancement is manual. The system does not "auto-close" rounds after X days; a Collector/Admin must click Execute.
- **Member Self-Removal**: Active members in an established Equb cannot remove themselves. They must be removed by an Admin to preserve financial solvency.

### 3. Technical Limitations
- **Offline Mode**: The app requires an active internet connection for all financial actions. No offline-to-sync capability.
- **Concurrency**: While protected by `SERIALIZABLE` transactions, very high frequency execution (e.g. 1000/sec) on a single Equb may lead to transaction timeouts.

### 4. UI/UX
- **Interactive Ledger**: The Activities ledger is structurally frozen and read-only. Filtering and advanced search in the UI are limited to basic pagination.
- **Theming**: UI is optimized for Dark Mode ("Industrial Ledger"). Light mode support is partial.

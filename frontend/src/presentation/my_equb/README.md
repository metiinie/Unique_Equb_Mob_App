# My Equb Domain
**Domain Boundary for Equb Operations**

This directory (`src/presentation/my_equb/`) contains the unified entry point and shared components for the "My Equb" tab.

## 🏗 Architecture
**Pattern:** Single Tab Route → Shared Layout → Role-based Sections → Pure Components

The `MyEqubTabScreen.tsx` serves as the spine. It does **not** contain business logic or complex UI. It orchestrates role-based sections.

## 🧱 Section Order (Fixed)
1. **EqubContextHeader** (Always visible)
2. **EqubOverviewSection**
3. **ContributionsSection**
4. **PayoutsSection** (Role-aware)
5. **MembersSection** (Role-aware)
6. **RulesAndAgreementSection** (Read-only)
7. **AuditLogSection** (Admin only)

## 🚫 Constraints
- No child components generated yet.
- No navigation imports (except pure types).
- No payout UI in the screen (must be in section).
- No nested navigators.

## 🗺 Roadmap
1. **EqubOverviewSection**: Cards with status/cycle.
2. **ContributionsSection**: History & status.
3. **PayoutsSection**: Admin execution flow.
4. **MembersSection**: Management & lists.
5. **Rules & Audit**: Static views.

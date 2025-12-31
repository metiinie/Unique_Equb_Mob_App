# Integration Verification: Step 1 — Login & Session Bootstrap

This document outlines the steps to verify the humble Login and Session Bootstrap flow.

## 1. Automated Unit Tests
Run the following command to verify the API client and auth logic:
```bash
cd frontend
npm test tests/presentation/auth/auth_flow.test.ts
```

## 2. Manual Integration Flow (Dev Environment)

### Prerequisites
- Backend must be running: `cd backend && npm run start:dev`
- Frontend dev server: `cd frontend && npx expo start`

### Flow A: Cold Boot (No Session)
1. **Action**: Open the app.
2. **Behavior**: `SessionBootstrapScreen` (Loading) appears briefly.
3. **Intent**: Backend `/auth/me` returns `401 Unauthorized`.
4. **Result**: App automatically redirects to `LoginScreen`.

### Flow B: Successful Login
1. **Action**: Enter valid email/password on `LoginScreen` and press "Authenticate".
2. **Behavior**: `LoginScreen` shows loading state.
3. **Intent**: Backend `/auth/login` returns `200 OK` + `UserDto` + sets `httpOnly` cookie.
4. **Transition**: App reacts to `AuthContext` update and fades into `MainTabs` (Placeholder).

### Flow C: Session Persistence (Warm Boot)
1. **Action**: After successful login, reload the app (`r` in Expo or kill/restart).
2. **Behavior**: `SessionBootstrapScreen` appears.
3. **Intent**: Backend `/auth/me` returns `200 OK` + `UserDto` (using the persistence cookie).
4. **Result**: App skips `LoginScreen` and lands directly on `MainTabs`.

### Flow D: Invalid Credentials
1. **Action**: Enter invalid credentials.
2. **Behavior**: Backend returns `401 Unauthorized` with message "Invalid email or password".
3. **Result**: `LoginScreen` shows an Alert with the **exact** backend message.

## 3. Lawful Constraints Verified
- [x] **No hardcoded roles**: Frontend waits for `UserDto.role`.
- [x] **No local lifecycle**: `EqubStatus` and `ContributionStatus` are 1:1 with Prisma.
- [x] **Cookie-based**: `ApiClient` uses `credentials: 'include'`.
- [x] **Humble UI**: Navigation is driven by `isAuthenticated` state from the backend.

# Unique Equb System - Development Rules

This document outlines the core architectural and development principles of the Unique Equb System.

## 1. The "Backend is Law" Principle
The backend (NestJS) is the final authority for all business logic, state transitions, and validation.
- No business logic should ever be duplicated or implemented on the frontend.
- The frontend must never "guess" the next state or validate if an operation is allowed; it must attempt the operation and handle the backend's result.

## 2. The "Thin Humble Terminal" Principle
The frontend (React Native) is a simple presentation layer.
- **Dumb Views**: Components should display data exactly as recieved from the DTOs.
- **No Local Validation**: Frontend does not validate amount ranges, round numbers, or permissions. It surfaces backend error messages verbatim to the user.
- **Authoritative Enums**: Enums are shared (via protocol/contract) and must be `SCREAMING_SNAKE_CASE` as defined in the Prisma schema.

## 3. Communication & Security
- **Secure Cookies**: All authentication is handled via `httpOnly` cookies. The frontend must use `credentials: 'include'` for all requests.
- **DTO Compliance**: All data passed between layers must adhere to the defined `readonly` DTO patterns.
- **Environment Variables**: Use `EXPO_PUBLIC_API_URL` to point the frontend to the backend gateway.

## 4. Lifecycle Flow
- **DRAFT**: Equb is being configured.
- **ACTIVE**: Equb is live and accepting contributions.
- **ON_HOLD**: Equb is temporarily paused.
- **COMPLETED/TERMINATED**: Terminal states. Records are read-only.

## 5. Audit Traceability
Every state-changing operation must be logged in the `AuditEvent` table by the backend, capturing the actor, the entity, and the previous/new states.

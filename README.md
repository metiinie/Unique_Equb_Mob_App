# Unique Equb System

A professional Digital Equb Management System built with React Native and Expo.

## Getting Started

This project is a React Native application managed by Expo.

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
2. Run `npm install`
3. Start the development server: `npm start`

### Testing

This project uses Jest for comprehensive unit and integration testing of domain logic.

- Run all tests: `npm test`
- Run domain tests only: `npm run test:domain`
- Run infrastructure tests only: `npm run test:infrastructure`
- View coverage: `npm run test:coverage`



<!-- Quick Tips to Avoid Errors

Authorization Error (ROLE_PERMISSION_ERROR)

Always include Authorization: Bearer admin-1:admin in headers.

Check there are no typos or extra spaces.

Contribution / Payout Not Found

Make sure the IDs match exactly with seeded mock data:

Equb: "equb-1"

Contribution: "c1"

Payout: "p1"

No extra spaces.

Whitespace Handling

Even one trailing space in equbId, contributionId, payoutId, or commandId will break matching.

Handlers now trim values, but always send clean JSON to be safe.

Header Duplicates

Remove extra Content-Type or Authorization entries. Postman sometimes duplicates when switching between tabs. -->
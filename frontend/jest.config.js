/** @type {import('jest').Config} */
module.exports = {
    // Use ts-jest preset for TypeScript support
    preset: 'ts-jest',

    // Node environment for backend/domain logic tests
    testEnvironment: 'node',

    // Look for tests in the tests/ directory
    roots: ['<rootDir>/tests'],

    // Match test files with .test.ts extension
    testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts',
    ],

    // Transform TypeScript files
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },

    // Module path aliases (match tsconfig paths)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Coverage collection
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
    ],

    // Coverage threshold (aspirational - adjust as needed)
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },

    // Verbose output for debugging
    verbose: true,

    // Timeout for async tests (30 seconds)
    testTimeout: 30000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks between tests
    restoreMocks: true,

    // Reset mocks between tests
    resetMocks: true,
};

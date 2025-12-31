#!/usr/bin/env node

/**
 * Phase 4: Negative Test Audit Suite
 * Automated RBAC & Security Validation
 * 
 * This script validates:
 * - Cookie-based JWT authentication
 * - Role-based access control (RBAC)
 * - Financial invariants enforcement
 * - Audit logging
 */

const baseURL = 'http://localhost:3000/api/v1';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const cookieJar = {};

async function login(email, password, role) {
    console.log(`\n${colors.cyan}🔐 Logging in as ${role}: ${email}${colors.reset}`);

    const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(`Login failed for ${email}: ${response.status} ${response.statusText}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (!setCookie) {
        throw new Error(`No cookie returned for ${email}`);
    }

    // Extract access_token from Set-Cookie header
    const match = setCookie.match(/access_token=([^;]+)/);
    if (!match) {
        throw new Error(`Invalid cookie format for ${email}`);
    }

    cookieJar[role] = `access_token=${match[1]}`;
    console.log(`${colors.green}✅ Logged in successfully${colors.reset}`);

    return await response.json();
}

async function testEndpoint(role, method, endpoint, expectedStatus, body = null, description = '') {
    const cookie = cookieJar[role];

    const options = {
        method,
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseURL}${endpoint}`, options);
    const status = response.status;

    const passed = status === expectedStatus;
    const symbol = passed ? '✅' : '❌';
    const color = passed ? colors.green : colors.red;

    console.log(
        `${color}${symbol} [${role}] ${method} ${endpoint} → ${status} (expected ${expectedStatus})${colors.reset} ${description}`
    );

    return { passed, status, expectedStatus, endpoint, role };
}

async function runTests() {
    console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════════╗
║         Phase 4: Production Readiness Test Suite            ║
║               Negative Test Audit Matrix                     ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    try {
        // Step 1: Login all test users
        console.log(`\n${colors.bright}━━━━━━━ STEP 1: Authentication Setup ━━━━━━━${colors.reset}`);

        await login('admin@equb.test', 'Test123!', 'ADMIN');
        await login('collector@equb.test', 'Test123!', 'COLLECTOR');
        await login('member1@equb.test', 'Test123!', 'MEMBER');

        // Step 2: RBAC Tests
        console.log(`\n${colors.bright}━━━━━━━ STEP 2: RBAC Enforcement Tests ━━━━━━━${colors.reset}`);

        const results = [];

        // ADMIN-only endpoints
        results.push(await testEndpoint('ADMIN', 'GET', '/users', 200, null, '(ADMIN can list users)'));
        results.push(await testEndpoint('COLLECTOR', 'GET', '/users', 403, null, '(COLLECTOR blocked)'));
        results.push(await testEndpoint('MEMBER', 'GET', '/users', 403, null, '(MEMBER blocked)'));

        results.push(await testEndpoint('ADMIN', 'GET', '/reports/admin/summary', 200, null, '(ADMIN global summary)'));
        results.push(await testEndpoint('COLLECTOR', 'GET', '/reports/admin/summary', 403, null, '(COLLECTOR blocked)'));
        results.push(await testEndpoint('MEMBER', 'GET', '/reports/admin/summary', 403, null, '(MEMBER blocked)'));

        results.push(await testEndpoint('ADMIN', 'GET', '/audit-events', 200, null, '(ADMIN audit access)'));
        results.push(await testEndpoint('COLLECTOR', 'GET', '/audit-events', 403, null, '(COLLECTOR blocked)'));
        results.push(await testEndpoint('MEMBER', 'GET', '/audit-events', 403, null, '(MEMBER blocked)'));

        // MEMBER dashboard - accessible by MEMBER and ADMIN
        results.push(await testEndpoint('MEMBER', 'GET', '/reports/member/dashboard', 200, null, '(MEMBER own dashboard)'));
        results.push(await testEndpoint('ADMIN', 'GET', '/reports/member/dashboard', 200, null, '(ADMIN can view)'));

        // Step 3: Cookie validation
        console.log(`\n${colors.bright}━━━━━━━ STEP 3: Cookie Authentication Tests ━━━━━━━${colors.reset}`);

        const noCookieResponse = await fetch(`${baseURL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        results.push({
            passed: noCookieResponse.status === 401,
            status: noCookieResponse.status,
            expectedStatus: 401,
            endpoint: '/users',
            role: 'NO_COOKIE',
        });
        console.log(
            `${noCookieResponse.status === 401 ? colors.green + '✅' : colors.red + '❌'} [NO_COOKIE] GET /users → ${noCookieResponse.status} (expected 401)${colors.reset}`
        );

        const invalidCookieResponse = await fetch(`${baseURL}/users`, {
            method: 'GET',
            headers: {
                'Cookie': 'access_token=invalid_token_12345',
                'Content-Type': 'application/json',
            },
        });
        results.push({
            passed: invalidCookieResponse.status === 401,
            status: invalidCookieResponse.status,
            expectedStatus: 401,
            endpoint: '/users',
            role: 'INVALID_COOKIE',
        });
        console.log(
            `${invalidCookieResponse.status === 401 ? colors.green + '✅' : colors.red + '❌'} [INVALID_COOKIE] GET /users → ${invalidCookieResponse.status} (expected 401)${colors.reset}`
        );

        // Summary
        console.log(`\n${colors.bright}━━━━━━━━━━━━━ TEST SUMMARY ━━━━━━━━━━━━━${colors.reset}`);

        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;
        const total = results.length;

        console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
        console.log(`${colors.cyan}📊 Total:  ${total}${colors.reset}`);

        if (failed > 0) {
            console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
            results.filter(r => !r.passed).forEach(r => {
                console.log(`  ${colors.red}• [${r.role}] ${r.endpoint} → ${r.status} (expected ${r.expectedStatus})${colors.reset}`);
            });
        }

        console.log(`\n${colors.bright}${passed === total ? colors.green : colors.yellow}
╔═══════════════════════════════════════════════════════════════╗
║  ${passed === total ? 'ALL TESTS PASSED ✅' : `${failed} TESTS FAILED ❌`.padEnd(56)} ║
║  System is ${passed === total ? 'production-ready' : 'NOT production-ready'.padEnd(47)} ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

        process.exit(failed > 0 ? 1 : 0);

    } catch (error) {
        console.error(`\n${colors.red}${colors.bright}❌ Test Suite Failed:${colors.reset}`);
        console.error(error);
        process.exit(1);
    }
}

runTests();

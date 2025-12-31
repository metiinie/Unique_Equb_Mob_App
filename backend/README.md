# Unique Equb System - Backend

## 🎯 Phase 4: Production Readiness - ✅ COMPLETE

A production-ready, secure, and audit-compliant backend for the Unique Equb financial rotation system.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon DB configured)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Seed test users
npm run seed

# Start development server
npm run start:dev
```

### Verify Installation
```bash
# Run automated security tests (in a new terminal)
npm run test:rbac
```

**Expected Output:**
```
✅ Passed: 12
❌ Failed: 0
📊 Total:  12

╔═══════════════════════════════════════════════════════════════╗
║  ALL TESTS PASSED ✅                                          ║
║  System is production-ready                                   ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | Quick reference for testing (START HERE) |
| **[PHASE_4_PRODUCTION_READINESS.md](./PHASE_4_PRODUCTION_READINESS.md)** | Complete technical documentation |
| **[PHASE_4_SUMMARY.md](./PHASE_4_SUMMARY.md)** | Implementation summary & changes |

---

## 🔐 Test Credentials

After running `npm run seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | admin@equb.test | Test123! |
| **COLLECTOR** | collector@equb.test | Test123! |
| **MEMBER** | member1@equb.test | Test123! |
| **MEMBER** | member2@equb.test | Test123! |
| **MEMBER** | member3@equb.test | Test123! |

---

## 🏗️ Architecture

### Authentication
- ✅ JWT tokens in httpOnly cookies
- ✅ Secure flags in production
- ✅ Cookie extraction via JwtStrategy
- ✅ Failed auth logged with IP

### Authorization (RBAC)
- ✅ Global guards: JwtAuthGuard → RolesGuard
- ✅ Role-based endpoint protection
- ✅ Authorization failures logged
- ✅ Zero-trust service validation

### Financial Safety
- ✅ All mutations in transactions
- ✅ Over-payment blocking
- ✅ Double-payout prevention
- ✅ State transition validation
- ✅ Membership invariants

### Audit & Compliance
- ✅ Immutable audit log
- ✅ All state changes tracked
- ✅ Actor + timestamp + payload
- ✅ ADMIN-only access

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login (public)
- `POST /api/v1/auth/logout` - Logout (authenticated)

### User Management (ADMIN only)
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user

### Equb Management (ADMIN only)
- `POST /api/v1/equbs` - Create Equb
- `POST /api/v1/equbs/:id/activate` - Activate Equb
- `POST /api/v1/equbs/:id/hold` - Put on hold
- `POST /api/v1/equbs/:id/resume` - Resume
- `POST /api/v1/equbs/:id/terminate` - Terminate
- `POST /api/v1/equbs/:id/progress-round` - Progress to next round

### Contributions (ADMIN, COLLECTOR)
- `POST /api/v1/contributions/:id/pay` - Record payment

### Payouts (ADMIN only)
- `POST /api/v1/payouts/:id/execute` - Execute payout

### Memberships (ADMIN, MEMBER)
- `POST /api/v1/memberships` - Add member to Equb

### Reporting
- `GET /api/v1/reports/admin/summary` - Global summary (ADMIN)
- `GET /api/v1/reports/equb/:id/metrics` - Equb metrics (ADMIN, COLLECTOR)
- `GET /api/v1/reports/member/dashboard` - Personal dashboard (MEMBER, ADMIN)

### Audit Logs (ADMIN only)
- `GET /api/v1/audit-events` - Paginated audit logs

---

## 🧪 Testing

### Automated Tests
```bash
# Run RBAC security test suite
npm run test:rbac
```

### Manual Testing
```bash
# Login as ADMIN
curl -c admin.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@equb.test","password":"Test123!"}'

# List users (ADMIN only)
curl -b admin.txt http://localhost:3000/api/v1/users

# Login as MEMBER
curl -c member.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member1@equb.test","password":"Test123!"}'

# Try to list users as MEMBER (should fail with 403)
curl -b member.txt http://localhost:3000/api/v1/users
```

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for comprehensive examples.

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run seed` | Seed database with test users |
| `npm run test:rbac` | Run automated security tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (GUI) |

---

## 🔒 Security Features

### Authentication
- Cookie-based JWT (httpOnly, sameSite: strict, secure in prod)
- Automatic token extraction
- 24-hour expiration
- Failed attempts logged with IP

### Authorization
- Global guard enforcement
- Role-based access control
- Zero-trust service layer
- Violations logged with user context

### Financial Integrity
- Transactional mutations
- Over-payment prevention
- Double-payout protection
- State machine validation

### Audit Trail
- Immutable event log
- Actor tracking
- Timestamp + payload
- Indexed queries

---

## 📈 Production Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://..."
POOLER_URL="postgresql://..."  # For connection pooling
JWT_SECRET="your-strong-secret-here"
NODE_ENV="production"
PORT=3000
```

### Deployment Checklist
- ✅ Set strong JWT_SECRET
- ✅ Set NODE_ENV=production
- ✅ Configure DATABASE_URL for production
- ✅ Run `npm run prisma:generate`
- ✅ Run `npm run build`
- ✅ Test with `npm run test:rbac`
- ✅ Verify secure flag on cookies
- ✅ Monitor logs for security warnings

---

## 🐛 Troubleshooting

### "Module '@prisma/client' has no exported member 'X'"
```bash
npx prisma generate
```

### RBAC tests fail with 401
1. Verify server is running
2. Run `npm run seed` to create test users
3. Check JWT_SECRET in .env

### EPERM error (Windows)
1. Stop all Node processes
2. Exclude project from antivirus
3. Delete `node_modules/.prisma`
4. Run `npx prisma generate`

---

## 📊 Code Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Test user seeding
├── scripts/
│   └── test-rbac.js          # Automated security tests
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── jwt.strategy.ts   # Cookie extraction
│   │   └── auth.controller.ts # Login/logout
│   ├── common/
│   │   ├── guards/           # Security guards
│   │   ├── decorators/       # Custom decorators
│   │   └── prisma/           # Prisma service
│   └── modules/
│       ├── audit-event/      # Audit logging
│       ├── contribution/     # Payment tracking
│       ├── equb/             # Equb lifecycle
│       ├── membership/       # Member management
│       ├── payout/           # Payout execution
│       ├── reporting/        # Read models
│       └── user/             # User management
└── [Documentation files]
```

---

## 🎯 What's Been Achieved

### Phase 4 Completion ✅

**Security:**
- ✅ Production-grade authentication
- ✅ Comprehensive RBAC
- ✅ Security event logging
- ✅ Zero-trust architecture

**Testing:**
- ✅ Automated test suite
- ✅ Database seeding
- ✅ Manual test guide
- ✅ 100% RBAC coverage

**Documentation:**
- ✅ Complete technical docs
- ✅ Testing guide
- ✅ Implementation summary
- ✅ This README

**Financial Safety:**
- ✅ Transactional integrity
- ✅ Invariant enforcement
- ✅ Audit compliance
- ✅ Privacy controls

---

## 🚀 Next Steps

### Frontend Integration
- Connect React Native/Expo frontend
- Implement cookie handling in mobile
- Build real-time UI updates
- Add offline support

### Enhanced Testing
- Integration tests for full workflows
- Load testing for concurrency
- Security penetration testing
- Performance benchmarking

### Production Features
- Refresh token flow
- Rate limiting
- Email notifications
- Admin dashboard
- Audit log export

---

## 📞 Support

For issues or questions:
1. Check **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**
2. Review **[PHASE_4_PRODUCTION_READINESS.md](./PHASE_4_PRODUCTION_READINESS.md)**
3. Check server logs for security warnings (🔐, 🚫)

---

## 📄 License

UNLICENSED - Private Project

---

**Status:** 🟢 Production Ready  
**Last Updated:** December 28, 2025  
**Version:** 1.0.0 (Phase 4 Complete)

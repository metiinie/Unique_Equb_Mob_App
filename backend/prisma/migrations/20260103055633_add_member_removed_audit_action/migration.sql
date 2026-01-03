-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('ADMIN', 'COLLECTOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "EqubStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('ADMIN', 'COLLECTOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED', 'LEFT');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'SETTLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SCHEDULED', 'EXECUTED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('EQUB_CREATED', 'EQUB_ACTIVATED', 'EQUB_ON_HOLD', 'EQUB_RESUMED', 'EQUB_TERMINATED', 'EQUB_COMPLETED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'CONTRIBUTION_CREATED', 'CONTRIBUTION_CONFIRMED', 'CONTRIBUTION_REJECTED', 'PAYOUT_CREATED', 'PAYOUT_COMPLETED', 'PAYOUT_REJECTED', 'ROUND_PROGRESSED', 'ROUND_CLOSED', 'CONTRIBUTION_SETTLED', 'INTEGRITY_CHECK_FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "GlobalRole" NOT NULL DEFAULT 'MEMBER',
    "notificationPreferences" JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equbs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "roundCycleLength" INTEGER NOT NULL DEFAULT 30,
    "status" "EqubStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "equbId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("equbId","userId")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "equbId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "equbId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actionType" "AuditActionType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "commandId" TEXT,
    "systemVersion" TEXT NOT NULL DEFAULT '0.0.0',

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");

-- CreateIndex
CREATE INDEX "contributions_memberId_idx" ON "contributions"("memberId");

-- CreateIndex
CREATE INDEX "contributions_equbId_roundNumber_idx" ON "contributions"("equbId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_equbId_memberId_roundNumber_key" ON "contributions"("equbId", "memberId", "roundNumber");

-- CreateIndex
CREATE INDEX "payouts_equbId_recipientUserId_idx" ON "payouts"("equbId", "recipientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_equbId_roundNumber_key" ON "payouts"("equbId", "roundNumber");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_timestamp_idx" ON "audit_events"("timestamp");

-- CreateIndex
CREATE INDEX "audit_events_actorUserId_idx" ON "audit_events"("actorUserId");

-- AddForeignKey
ALTER TABLE "equbs" ADD CONSTRAINT "equbs_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equbs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equbs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_equbId_fkey" FOREIGN KEY ("equbId") REFERENCES "equbs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

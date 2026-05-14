-- Migration: finance fixes
-- 1. Add TRANSFER to TransactionType enum
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'TRANSFER';

-- 2. Make categoryId nullable on Transaction (TRANSFER has no category)
ALTER TABLE "Transaction" ALTER COLUMN "categoryId" DROP NOT NULL;

-- 3. Add toAccountId to Transaction for TRANSFER destination
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "toAccountId" TEXT;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toAccountId_fkey"
  FOREIGN KEY ("toAccountId") REFERENCES "Account"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Add paidAt to RecurringBill
ALTER TABLE "RecurringBill" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- 5. Create GoalContribution table
CREATE TABLE IF NOT EXISTS "GoalContribution" (
  "id"        TEXT NOT NULL,
  "goalId"    TEXT NOT NULL,
  "amount"    INTEGER NOT NULL,
  "note"      TEXT,
  "date"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GoalContribution_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_goalId_fkey"
  FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
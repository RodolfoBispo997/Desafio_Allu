-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvestmentClosureReason" AS ENUM ('REACHED_MATURITY', 'REDEEMED_EARLY', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentReviewStatus" AS ENUM ('PENDING_MODERATION', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "investedAmount" DECIMAL(14,2) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "status" "InvestmentStatus" NOT NULL,
    "closureReason" "InvestmentClosureReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_review_invitations" (
    "id" UUID NOT NULL,
    "investmentId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_review_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_reviews" (
    "id" UUID NOT NULL,
    "investmentId" UUID NOT NULL,
    "overallExperienceRating" INTEGER NOT NULL,
    "informationClarityRating" INTEGER NOT NULL,
    "processEaseRating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "policyAcceptedAt" TIMESTAMP(3) NOT NULL,
    "status" "InvestmentReviewStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "moderatedAt" TIMESTAMP(3),
    "moderationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_review_attachments" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_review_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "investment_review_invitations_token_key" ON "investment_review_invitations"("token");

-- CreateIndex
CREATE INDEX "investment_review_invitations_investmentId_idx" ON "investment_review_invitations"("investmentId");

-- CreateIndex
CREATE INDEX "investment_review_invitations_expiresAt_idx" ON "investment_review_invitations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "investment_reviews_investmentId_key" ON "investment_reviews"("investmentId");

-- CreateIndex
CREATE INDEX "investment_reviews_status_idx" ON "investment_reviews"("status");

-- CreateIndex
CREATE INDEX "investment_reviews_createdAt_idx" ON "investment_reviews"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "investment_review_attachments_storageKey_key" ON "investment_review_attachments"("storageKey");

-- CreateIndex
CREATE INDEX "investment_review_attachments_reviewId_idx" ON "investment_review_attachments"("reviewId");

-- AddForeignKey
ALTER TABLE "investment_review_invitations" ADD CONSTRAINT "investment_review_invitations_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_reviews" ADD CONSTRAINT "investment_reviews_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_review_attachments" ADD CONSTRAINT "investment_review_attachments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "investment_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

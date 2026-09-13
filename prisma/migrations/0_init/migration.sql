-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'AGENT', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'INVITED');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'REPLIED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'CONVERTED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('SUBMITTED', 'NEEDS_INFORMATION', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'WAITING_FOR_REVIEW', 'ACCEPTED', 'REJECTED', 'PLANNING', 'UI_UX', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW', 'ON_HOLD', 'FINAL_DELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED_FOR_APPROVAL', 'APPROVED', 'CHANGES_REQUESTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('REQUIREMENT', 'BRAND_ASSET', 'PROPOSAL', 'INVOICE', 'CONTRACT', 'REPORT', 'SOURCE_DELIVERABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AuditStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EmailType" AS ENUM ('PROPOSAL', 'SALES', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED', 'REPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EmailDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "public"."SalesActivityType" AS ENUM ('INITIAL_OUTREACH', 'FOLLOW_UP', 'DEMO_REQUEST', 'MEETING_REQUEST', 'PROPOSAL_REQUEST', 'NEGOTIATION', 'WON', 'LOST', 'NOT_INTERESTED', 'NO_RESPONSE');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'REVERSED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT,
    "role" "public"."Role" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Agent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designation" TEXT,
    "territories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "country" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "city" TEXT,
    "website" TEXT,
    "companyDescription" TEXT,
    "profileImage" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "termsAcceptedAt" TIMESTAMP(3),
    "assignedAgentId" TEXT,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "country" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "status" "public"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "projectType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "targetAudience" TEXT,
    "deadline" TIMESTAMP(3),
    "budgetEstimate" DECIMAL(12,2),
    "referenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalValue" DECIMAL(12,2),
    "advanceAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'SUBMITTED',
    "rejectionReason" TEXT,
    "onHoldFromStatus" "public"."ProjectStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectStatusHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromStatus" "public"."ProjectStatus",
    "toStatus" "public"."ProjectStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentage" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "public"."MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "requiresClientApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "documentType" "public"."DocumentType" NOT NULL DEFAULT 'OTHER',
    "version" INTEGER NOT NULL DEFAULT 1,
    "projectId" TEXT,
    "clientId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" "public"."Role" NOT NULL,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "previousValue" JSONB,
    "newValue" JSONB,
    "status" "public"."AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "errorDetail" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,
    "amount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "documentId" TEXT,
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailThread" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "clientId" TEXT,
    "leadId" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "emailType" "public"."EmailType" NOT NULL,
    "direction" "public"."EmailDirection" NOT NULL DEFAULT 'OUTBOUND',
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toEmails" TEXT[],
    "ccEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bccEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "replyTo" TEXT,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "readAt" TIMESTAMP(3),
    "important" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "proposalId" TEXT,
    "leadId" TEXT,
    "clientId" TEXT,
    "providerMessageId" TEXT,
    "providerThreadId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailMessageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "providerAttachmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailEvent" (
    "id" TEXT NOT NULL,
    "emailMessageId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerEventId" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailDraft" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "emailType" "public"."EmailType" NOT NULL,
    "toEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ccEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bccEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT,
    "htmlBody" TEXT,
    "textBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuppressedRecipient" (
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuppressedRecipient_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "public"."SalesActivity" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,
    "emailMessageId" TEXT,
    "activityType" "public"."SalesActivityType" NOT NULL,
    "notes" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "leadId" TEXT,
    "clientId" TEXT,
    "projectId" TEXT,
    "dueAt" TIMESTAMP(3),
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommissionRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "percentage" DECIMAL(5,2),
    "flatAmount" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Commission" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "commissionRuleId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "calculationSnapshot" JSONB,
    "idempotencyKey" TEXT NOT NULL,
    "reversalReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "public"."Agent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "public"."Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_leadId_key" ON "public"."Client"("leadId");

-- CreateIndex
CREATE INDEX "Client_assignedAgentId_idx" ON "public"."Client"("assignedAgentId");

-- CreateIndex
CREATE INDEX "Lead_agentId_idx" ON "public"."Lead"("agentId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "public"."Lead"("status");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "public"."Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_assignedAgentId_idx" ON "public"."Project"("assignedAgentId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "public"."Project"("status");

-- CreateIndex
CREATE INDEX "ProjectStatusHistory_projectId_idx" ON "public"."ProjectStatusHistory"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "public"."Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Document_projectId_idx" ON "public"."Document"("projectId");

-- CreateIndex
CREATE INDEX "Document_clientId_idx" ON "public"."Document"("clientId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "public"."AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_status_idx" ON "public"."AuditLog"("status");

-- CreateIndex
CREATE INDEX "Proposal_agentId_idx" ON "public"."Proposal"("agentId");

-- CreateIndex
CREATE INDEX "Proposal_leadId_idx" ON "public"."Proposal"("leadId");

-- CreateIndex
CREATE INDEX "Proposal_clientId_idx" ON "public"."Proposal"("clientId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "public"."Proposal"("status");

-- CreateIndex
CREATE INDEX "EmailThread_agentId_idx" ON "public"."EmailThread"("agentId");

-- CreateIndex
CREATE INDEX "EmailThread_clientId_idx" ON "public"."EmailThread"("clientId");

-- CreateIndex
CREATE INDEX "EmailThread_leadId_idx" ON "public"."EmailThread"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_providerMessageId_key" ON "public"."EmailMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "EmailMessage_agentId_idx" ON "public"."EmailMessage"("agentId");

-- CreateIndex
CREATE INDEX "EmailMessage_clientId_idx" ON "public"."EmailMessage"("clientId");

-- CreateIndex
CREATE INDEX "EmailMessage_leadId_idx" ON "public"."EmailMessage"("leadId");

-- CreateIndex
CREATE INDEX "EmailMessage_emailType_idx" ON "public"."EmailMessage"("emailType");

-- CreateIndex
CREATE INDEX "EmailMessage_status_idx" ON "public"."EmailMessage"("status");

-- CreateIndex
CREATE INDEX "EmailMessage_createdAt_idx" ON "public"."EmailMessage"("createdAt");

-- CreateIndex
CREATE INDEX "EmailMessage_threadId_idx" ON "public"."EmailMessage"("threadId");

-- CreateIndex
CREATE INDEX "EmailAttachment_emailMessageId_idx" ON "public"."EmailAttachment"("emailMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEvent_providerEventId_key" ON "public"."EmailEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "EmailEvent_emailMessageId_idx" ON "public"."EmailEvent"("emailMessageId");

-- CreateIndex
CREATE INDEX "EmailEvent_eventType_idx" ON "public"."EmailEvent"("eventType");

-- CreateIndex
CREATE INDEX "EmailDraft_agentId_idx" ON "public"."EmailDraft"("agentId");

-- CreateIndex
CREATE INDEX "SalesActivity_agentId_idx" ON "public"."SalesActivity"("agentId");

-- CreateIndex
CREATE INDEX "SalesActivity_leadId_idx" ON "public"."SalesActivity"("leadId");

-- CreateIndex
CREATE INDEX "SalesActivity_clientId_idx" ON "public"."SalesActivity"("clientId");

-- CreateIndex
CREATE INDEX "Task_agentId_idx" ON "public"."Task"("agentId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "public"."Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueAt_idx" ON "public"."Task"("dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_idempotencyKey_key" ON "public"."Commission"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Commission_agentId_idx" ON "public"."Commission"("agentId");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "public"."Commission"("status");

-- CreateIndex
CREATE INDEX "Commission_sourceType_sourceId_idx" ON "public"."Commission"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectStatusHistory" ADD CONSTRAINT "ProjectStatusHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailThread" ADD CONSTRAINT "EmailThread_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailThread" ADD CONSTRAINT "EmailThread_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailThread" ADD CONSTRAINT "EmailThread_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."EmailThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailMessage" ADD CONSTRAINT "EmailMessage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "public"."EmailMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailEvent" ADD CONSTRAINT "EmailEvent_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "public"."EmailMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailDraft" ADD CONSTRAINT "EmailDraft_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesActivity" ADD CONSTRAINT "SalesActivity_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesActivity" ADD CONSTRAINT "SalesActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesActivity" ADD CONSTRAINT "SalesActivity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commission" ADD CONSTRAINT "Commission_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commission" ADD CONSTRAINT "Commission_commissionRuleId_fkey" FOREIGN KEY ("commissionRuleId") REFERENCES "public"."CommissionRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;


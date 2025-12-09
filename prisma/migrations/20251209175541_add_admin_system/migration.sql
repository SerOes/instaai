-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'de',
    "systemPrompt" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" TEXT,
    "invitedAt" DATETIME,
    "brandName" TEXT,
    "industry" TEXT,
    "targetAudience" TEXT,
    "brandStyle" TEXT NOT NULL DEFAULT '[]',
    "contentGoals" TEXT NOT NULL DEFAULT '[]',
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyEncrypted" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "igBusinessId" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileName" TEXT,
    "profilePicture" TEXT,
    "followersCount" INTEGER,
    "followingCount" INTEGER,
    "mediaCount" INTEGER,
    "lastSynced" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstagramAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'GENERATED',
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "prompt" TEXT,
    "style" TEXT,
    "aspectRatio" TEXT,
    "model" TEXT,
    "provider" TEXT,
    "presetId" TEXT,
    "videoDuration" INTEGER,
    "videoResolution" TEXT,
    "videoProvider" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MediaProject_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "AiPreset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Caption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'de',
    "text" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL DEFAULT '[]',
    "tone" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Caption_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MediaProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "postType" TEXT NOT NULL DEFAULT 'FEED',
    "igPostId" TEXT,
    "igPermalink" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MediaProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostSchedule_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramAccountId" TEXT NOT NULL,
    "igPostId" TEXT NOT NULL,
    "projectId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "engagement" REAL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsRecord_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "category" TEXT NOT NULL,
    "promptTemplate" TEXT NOT NULL,
    "style" TEXT,
    "aspectRatio" TEXT,
    "duration" INTEGER,
    "colorPalette" TEXT NOT NULL DEFAULT '[]',
    "fontFamily" TEXT,
    "logoPosition" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DMConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramAccountId" TEXT NOT NULL,
    "igConversationId" TEXT NOT NULL,
    "participantIgId" TEXT NOT NULL,
    "participantUsername" TEXT,
    "participantName" TEXT,
    "participantPicture" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" DATETIME,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DMConversation_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "igMessageId" TEXT,
    "direction" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "aiStatus" TEXT,
    "aiResponse" TEXT,
    "aiConfidence" REAL,
    "aiModel" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "repliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DirectMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DMConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DMAutomation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramAccountId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'de',
    "tone" TEXT NOT NULL DEFAULT 'friendly',
    "responseDelay" INTEGER NOT NULL DEFAULT 0,
    "systemPrompt" TEXT,
    "contextWindow" INTEGER NOT NULL DEFAULT 5,
    "maxResponseLength" INTEGER NOT NULL DEFAULT 500,
    "categoryResponses" TEXT NOT NULL DEFAULT '{}',
    "quickReplies" TEXT NOT NULL DEFAULT '[]',
    "keywords" TEXT NOT NULL DEFAULT '{}',
    "blacklistedPhrases" TEXT NOT NULL DEFAULT '[]',
    "operatingHours" TEXT NOT NULL DEFAULT '{}',
    "outOfOfficeMessage" TEXT,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "totalAutoReplied" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DMAutomation_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeasonalIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "videoPrompt" TEXT,
    "captionSuggestion" TEXT,
    "hashtags" TEXT NOT NULL DEFAULT '[]',
    "seasonalTags" TEXT NOT NULL DEFAULT '[]',
    "suggestedDate" DATETIME,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeasonalIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_key" ON "Invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_invitedById_idx" ON "Invitation"("invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ApiKey_userId_provider_idx" ON "ApiKey"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramAccount_igBusinessId_key" ON "InstagramAccount"("igBusinessId");

-- CreateIndex
CREATE INDEX "InstagramAccount_userId_idx" ON "InstagramAccount"("userId");

-- CreateIndex
CREATE INDEX "MediaProject_userId_status_idx" ON "MediaProject"("userId", "status");

-- CreateIndex
CREATE INDEX "MediaProject_userId_type_idx" ON "MediaProject"("userId", "type");

-- CreateIndex
CREATE INDEX "Caption_projectId_language_idx" ON "Caption"("projectId", "language");

-- CreateIndex
CREATE INDEX "PostSchedule_scheduledAt_status_idx" ON "PostSchedule"("scheduledAt", "status");

-- CreateIndex
CREATE INDEX "PostSchedule_instagramAccountId_idx" ON "PostSchedule"("instagramAccountId");

-- CreateIndex
CREATE INDEX "AnalyticsRecord_instagramAccountId_capturedAt_idx" ON "AnalyticsRecord"("instagramAccountId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsRecord_igPostId_capturedAt_key" ON "AnalyticsRecord"("igPostId", "capturedAt");

-- CreateIndex
CREATE INDEX "AiPreset_userId_type_idx" ON "AiPreset"("userId", "type");

-- CreateIndex
CREATE INDEX "AiPreset_category_isPublic_idx" ON "AiPreset"("category", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "DMConversation_igConversationId_key" ON "DMConversation"("igConversationId");

-- CreateIndex
CREATE INDEX "DMConversation_instagramAccountId_lastMessageAt_idx" ON "DMConversation"("instagramAccountId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "DMConversation_participantIgId_idx" ON "DMConversation"("participantIgId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_igMessageId_key" ON "DirectMessage"("igMessageId");

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_sentAt_idx" ON "DirectMessage"("conversationId", "sentAt");

-- CreateIndex
CREATE INDEX "DirectMessage_direction_aiStatus_idx" ON "DirectMessage"("direction", "aiStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DMAutomation_instagramAccountId_key" ON "DMAutomation"("instagramAccountId");

-- CreateIndex
CREATE INDEX "DMAutomation_isEnabled_idx" ON "DMAutomation"("isEnabled");

-- CreateIndex
CREATE INDEX "SeasonalIdea_userId_month_year_idx" ON "SeasonalIdea"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "SeasonalIdea_userId_isUsed_idx" ON "SeasonalIdea"("userId", "isUsed");

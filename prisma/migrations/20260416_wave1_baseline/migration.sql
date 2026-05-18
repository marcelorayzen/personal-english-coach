-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('conversation', 'reading', 'review');

-- CreateEnum
CREATE TYPE "UtteranceRole" AS ENUM ('learner', 'coach', 'system');

-- CreateEnum
CREATE TYPE "MistakeCategory" AS ENUM ('grammar', 'vocabulary', 'pronunciation', 'fluency', 'syntax', 'word_choice', 'reading_accuracy');

-- CreateEnum
CREATE TYPE "PtBrSupportLevel" AS ENUM ('high', 'medium', 'low', 'minimal');

-- CreateEnum
CREATE TYPE "CorrectionIntensity" AS ENUM ('light', 'balanced', 'high');

-- CreateTable
CREATE TABLE "LearnerProfile" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "levelEstimate" TEXT,
    "speakingConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "readingConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "ptBrSupportLevel" "PtBrSupportLevel" NOT NULL DEFAULT 'medium',
    "correctionIntensity" "CorrectionIntensity" NOT NULL DEFAULT 'balanced',
    "preferredInteractionStyle" TEXT,
    "currentFocus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningSession" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utterance" (
    "id" TEXT NOT NULL,
    "learningSessionId" TEXT NOT NULL,
    "role" "UtteranceRole" NOT NULL,
    "transcript" TEXT NOT NULL,
    "languageCode" TEXT,
    "provider" TEXT,
    "durationMs" INTEGER,
    "transcriptionConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utterance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "category" "MistakeCategory" NOT NULL,
    "sourceText" TEXT NOT NULL,
    "correctedText" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMastery" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationTarget" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PronunciationTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerSnapshot" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewQueueItem" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "id" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "ptBrSupportLevel" "PtBrSupportLevel" NOT NULL DEFAULT 'medium',
    "correctionIntensity" "CorrectionIntensity" NOT NULL DEFAULT 'balanced',
    "learningGoal" TEXT,
    "currentFocus" TEXT,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_learnerProfileId_key" ON "Preferences"("learnerProfileId");

-- AddForeignKey
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utterance" ADD CONSTRAINT "Utterance_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES "LearningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMastery" ADD CONSTRAINT "SkillMastery_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerSnapshot" ADD CONSTRAINT "LearnerSnapshot_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


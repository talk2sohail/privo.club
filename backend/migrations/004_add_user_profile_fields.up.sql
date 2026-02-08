-- Add bio, profileVisibility, and notificationPreferences to User table
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "profileVisibility" TEXT DEFAULT 'PUBLIC';
ALTER TABLE "User" ADD COLUMN "notificationPreferences" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

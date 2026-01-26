-- Remove profile fields from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "notificationPreferences";
ALTER TABLE "User" DROP COLUMN IF EXISTS "profileVisibility";
ALTER TABLE "User" DROP COLUMN IF EXISTS "bio";

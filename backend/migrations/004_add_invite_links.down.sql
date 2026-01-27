-- Drop CircleInviteLink table
DROP TABLE IF EXISTS "CircleInviteLink";

-- Remove isInviteLinkEnabled column from Circle table
ALTER TABLE "Circle" DROP COLUMN IF EXISTS "isInviteLinkEnabled";

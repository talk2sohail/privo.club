-- Add isInviteLinkEnabled column to Circle table
ALTER TABLE "Circle" ADD COLUMN "isInviteLinkEnabled" BOOLEAN NOT NULL DEFAULT true;

-- Create CircleInviteLink table for limited-use auto-approve invite links
CREATE TABLE IF NOT EXISTS "CircleInviteLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "maxUses" INTEGER NOT NULL CHECK ("maxUses" > 0),
    "usedCount" INTEGER NOT NULL DEFAULT 0 CHECK ("usedCount" >= 0 AND "usedCount" <= "maxUses"),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "CircleInviteLink_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CircleInviteLink_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS "CircleInviteLink_code_idx" ON "CircleInviteLink"("code");

-- Create index on circleId for faster queries
CREATE INDEX IF NOT EXISTS "CircleInviteLink_circleId_idx" ON "CircleInviteLink"("circleId");

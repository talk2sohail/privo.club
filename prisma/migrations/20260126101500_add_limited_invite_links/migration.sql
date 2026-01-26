-- AlterTable
ALTER TABLE "Circle" ADD COLUMN "isInviteLinkEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "CircleMember" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "CircleInviteLink" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "CircleInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CircleInviteLink_code_key" ON "CircleInviteLink"("code");

-- AddForeignKey
ALTER TABLE "CircleInviteLink" ADD CONSTRAINT "CircleInviteLink_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleInviteLink" ADD CONSTRAINT "CircleInviteLink_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON UPDATE CASCADE;

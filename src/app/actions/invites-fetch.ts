"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getMyInvites() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.invite.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        {
          circle: {
            members: {
              some: { userId: session.user.id },
            },
          },
        },
      ],
    },
    include: {
      sender: true,
      circle: true,
      _count: {
        select: { rsvps: true },
      },
    },
    orderBy: { eventDate: "asc" },
  });
}

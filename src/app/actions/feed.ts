"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeedItem(
  inviteId: string,
  content: string,
  type: string = "UPDATE",
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (!content || content.trim() === "") {
    throw new Error("Content cannot be empty");
  }

  const feedItem = await prisma.eventFeedItem.create({
    data: {
      inviteId,
      userId: session.user.id,
      content,
      type,
    },
  });

  revalidatePath(`/event/${inviteId}`);
  return feedItem;
}

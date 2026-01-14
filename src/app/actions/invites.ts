"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InviteDetails } from "@/types";

export async function createInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventDate = new Date(formData.get("eventDate") as string);
  const circleId = formData.get("circleId") as string;

  // If circleId is "undefined" string or empty, treat as null
  const finalCircleId =
    circleId && circleId !== "undefined" && circleId.trim() !== ""
      ? circleId
      : null;

  if (finalCircleId) {
    const circle = await prisma.circle.findUnique({
      where: { id: finalCircleId },
    });
    if (!circle || circle.ownerId !== session.user.id) {
      throw new Error(
        "Unauthorized: You can only create events for circles you own.",
      );
    }
  }

  const invite = await prisma.invite.create({
    data: {
      title,
      description,
      location,
      eventDate,
      senderId: session.user.id,
      circleId: finalCircleId,
    },
  });

  revalidatePath("/");
  if (circleId) {
    revalidatePath(`/circle/${circleId}`);
  }
  return invite;
}

export async function getInvite(id: string) {
  return (await prisma.invite.findUnique({
    where: { id },
    include: {
      sender: true,
      circle: {
        include: {
          members: {
            include: { user: true },
          },
        },
      },
      rsvps: {
        include: { user: true },
      },
      feedItems: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      mediaItems: true,
    },
  })) as unknown as InviteDetails | null;
}

export async function submitRSVP(
  inviteId: string,
  status: string,
  guestCount: number,
  dietary?: string,
  note?: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rsvp = await prisma.rSVP.upsert({
    where: {
      inviteId_userId: {
        inviteId,
        userId: session.user.id,
      },
    },
    update: {
      status,
      guestCount,
      dietary,
      note,
    },
    create: {
      inviteId,
      userId: session.user.id,
      status,
      guestCount,
      dietary,
      note,
    },
  });

  revalidatePath(`/event/${inviteId}`);
  return rsvp;
}

export async function deleteInvite(inviteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) throw new Error("Invite not found");

  if (invite.senderId !== session.user.id) {
    throw new Error("Unauthorized: Only the host can delete this event");
  }

  await prisma.invite.delete({
    where: { id: inviteId },
  });

  // Revalidate circle page if it belongs to one
  if (invite.circleId) {
    revalidatePath(`/circle/${invite.circleId}`);
  }
  revalidatePath("/");
  return { success: true, circleId: invite.circleId };
}

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

  const invite = await prisma.invite.create({
    data: {
      title,
      description,
      location,
      eventDate,
      senderId: session.user.id,
      circleId: circleId || null,
    },
  });

  revalidatePath("/");
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

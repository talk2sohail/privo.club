"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CircleDetails } from "@/types";

export async function createCircle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const circle = await prisma.circle.create({
    data: {
      name,
      description,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/");
  return circle;
}

export async function getMyCircles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.circle.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
      owner: true,
    },
  });
}

export async function getCircle(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const circle = (await prisma.circle.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      invites: {
        orderBy: { eventDate: "desc" },
        include: {
          _count: {
            select: { rsvps: true },
          },
        },
      },
      owner: true,
    },
  })) as unknown as CircleDetails | null;

  if (!circle) return null;

  // Authorization check: User must be a member
  const isMember = circle.members.some(
    (member) => member.userId === session.user.id,
  );

  if (!isMember) return null;

  return circle;
}

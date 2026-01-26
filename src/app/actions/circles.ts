"use server";

import { revalidatePath } from "next/cache";
import { fetchFromBackend } from "@/lib/api";
import { CircleDetails, CirclePreview } from "@/types";

export async function createCircle(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const result = await fetchFromBackend("/circles", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

  revalidatePath("/");
  return result;
}

export async function getMyCircles(): Promise<CirclePreview[]> {
  try {
    const res = await fetchFromBackend("/circles");
    return res || [];
  } catch (err) {
    console.error("Failed to fetch circles:", err);
    return [];
  }
}



export async function getCircle(id: string): Promise<CircleDetails | null> {
  try {
    return await fetchFromBackend(`/circles/${id}`);
  } catch (e) {
    return null;
  }
}

export async function regenerateInviteCode(circleId: string) {
  const result = await fetchFromBackend(`/circles/${circleId}/regenerate`, {
    method: "POST",
  });
  revalidatePath(`/circle/${circleId}`);
  return result.inviteCode;
}

export async function joinCircleByCode(code: string) {
  try {
    const result = await fetchFromBackend(`/circles/join/${code}`, {
      method: "POST",
    });

    if (result.success) {
      revalidatePath(`/circle/${result.circleId}`);
      revalidatePath("/");
      return result;
    }
    throw new Error("Failed to join");
  } catch (e: any) {
    console.error("Join Loop Error:", e);
    throw new Error(e.message || "Failed to join circle");
  }
}



export async function getCircleByInviteCode(code: string): Promise<CirclePreview | null> {
  try {
    return await fetchFromBackend(`/circles/invite/${code}`);
  } catch (e) {
    return null;
  }
}

export async function deleteCircle(circleId: string) {
  await fetchFromBackend(`/circles/${circleId}`, {
    method: "DELETE",
  });

  revalidatePath("/");
  return { success: true };
}

export async function getPendingMembers(circleId: string) {
  try {
    return await fetchFromBackend(`/circles/${circleId}/pending`);
  } catch (e) {
    console.error("Failed to fetch pending members:", e);
    return [];
  }
}

export async function approveMember(circleId: string, userId: string) {
  await fetchFromBackend(`/circles/${circleId}/members/${userId}/approve`, {
    method: "POST",
  });
  revalidatePath(`/circle/${circleId}`);
}

export async function removeMember(circleId: string, userId: string) {
  await fetchFromBackend(`/circles/${circleId}/members/${userId}`, {
    method: "DELETE",
  });
  revalidatePath(`/circle/${circleId}`);
}

export async function updateCircleSettings(
  circleId: string,
  settings: { isInviteLinkEnabled?: boolean }
) {
  await fetchFromBackend(`/circles/${circleId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  revalidatePath(`/circle/${circleId}`);
}

export async function createInviteLink(circleId: string, maxUses: number) {
  const result = await fetchFromBackend(`/circles/${circleId}/invites`, {
    method: "POST",
    body: JSON.stringify({ maxUses }),
  });
  revalidatePath(`/circle/${circleId}`);
  return result;
}

export async function getInviteLinks(circleId: string) {
  try {
    return await fetchFromBackend(`/circles/${circleId}/invites`);
  } catch (e) {
    console.error("Failed to fetch invite links:", e);
    return [];
  }
}

export async function revokeInviteLink(circleId: string, inviteId: string) {
  await fetchFromBackend(`/circles/${circleId}/invites/${inviteId}`, {
    method: "DELETE",
  });
  revalidatePath(`/circle/${circleId}`);
}

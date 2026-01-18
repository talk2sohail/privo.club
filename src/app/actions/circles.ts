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

export async function getMyCircles() {
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
    const result = await fetchFromBackend("/circles/join", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (result.success) {
      revalidatePath(`/circle/${result.circleId}`);
      revalidatePath("/");
      return result;
    }
    throw new Error("Failed to join");
  } catch (e) {
    throw new Error("Invalid invite code");
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

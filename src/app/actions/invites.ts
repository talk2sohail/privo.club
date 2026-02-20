"use server";

import { revalidatePath } from "next/cache";
import { fetchFromBackend } from "@/lib/api";
import { InviteDetails, Invite } from "@/types";

export async function createInvite(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const eventDate = formData.get("eventDate") as string;
  const circleId = formData.get("circleId") as string;

  const finalCircleId =
    circleId && circleId !== "undefined" && circleId.trim() !== ""
      ? circleId
      : null;

  const result = await fetchFromBackend("/invites", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      location,
      eventDate,
      circleId: finalCircleId
    })
  });

  revalidatePath("/");
  if (finalCircleId) {
    revalidatePath(`/circle/${finalCircleId}`);
  }
  return result;
}

export async function getInvite(id: string) {
  // Go endpoint returns full details now
  try {
    return (await fetchFromBackend(`/invites/${id}`)) as InviteDetails | null;
  } catch (e) {
    return null;
  }
}

export async function submitRSVP(
  inviteId: string,
  status: string,
  guestCount: number,
  dietary?: string,
  note?: string,
) {
  const result = await fetchFromBackend(`/invites/${inviteId}/rsvp`, {
    method: "POST",
    body: JSON.stringify({
      status,
      guestCount,
      dietary,
      note
    })
  });

  revalidatePath(`/event/${inviteId}`);
  return result;
}

export async function deleteInvite(inviteId: string) {
  const result = await fetchFromBackend(`/invites/${inviteId}`, {
    method: "DELETE"
  });

  revalidatePath("/");
  return result;
}

export async function getMyInvites(): Promise<Invite[]> {
  try {
    const res = await fetchFromBackend("/invites");
    return res || [];
  } catch (err) {
    console.error("Failed to fetch invites:", err);
    return [];
  }
}

export async function updateInvite(inviteId: string, location?: string, mapLink?: string) {
  const result = await fetchFromBackend(`/invites/${inviteId}`, {
    method: "PATCH",
    body: JSON.stringify({
      location,
      mapLink
    })
  });

  revalidatePath(`/event/${inviteId}`);
  return result;
}

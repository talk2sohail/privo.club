"use server";

import { revalidatePath } from "next/cache";
import { fetchFromBackend } from "@/lib/api";

export async function createFeedItem(
  inviteId: string,
  content: string,
  type: string = "UPDATE",
) {
  const result = await fetchFromBackend("/feed", {
    method: "POST",
    body: JSON.stringify({
      inviteId,
      content,
      type
    })
  });

  revalidatePath(`/event/${inviteId}`);
  return result;
}

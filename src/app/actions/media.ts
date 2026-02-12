"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080/api";

export async function uploadMedia(formData: FormData) {
    const cookieStore = await cookies();
    const tokenCookie =
        cookieStore.get("__Secure-authjs.session-token") ||
        cookieStore.get("authjs.session-token") ||
        cookieStore.get("__Secure-next-auth.session-token") ||
        cookieStore.get("next-auth.session-token");

    if (!tokenCookie) {
        return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    const inviteId = formData.get("inviteId") as string;

    if (!file || !inviteId) {
        return { success: false, error: "Missing file or inviteId" };
    }

    try {
        const backendFormData = new FormData();
        backendFormData.append("file", file);
        backendFormData.append("inviteId", inviteId);

        const response = await fetch(`${BACKEND_URL}/media`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenCookie.value}`,
            },
            body: backendFormData,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Backend upload failed:", text);
            return { success: false, error: `Upload failed: ${text}` };
        }

        revalidatePath(`/event/${inviteId}`);
        revalidatePath(`/event/${inviteId}/gallery`);
        return { success: true };
    } catch (error) {
        console.error("Upload action error:", error);
        return { success: false, error: "Internal server error" };
    }
}

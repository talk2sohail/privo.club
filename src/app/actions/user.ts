"use server";

import { revalidatePath } from "next/cache";
import { fetchFromBackend } from "@/lib/api";
import { UserProfileResponse, UserStats } from "@/types";

export async function getUserProfile(
	userId: string,
): Promise<UserProfileResponse | null> {
	try {
		return await fetchFromBackend(`/users/${userId}/profile`);
	} catch (err) {
		console.error("Failed to fetch user profile:", err);
		return null;
	}
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
	try {
		return await fetchFromBackend(`/users/${userId}/stats`);
	} catch (err) {
		console.error("Failed to fetch user stats:", err);
		return null;
	}
}

export async function updateUserProfile(
	userId: string,
	data: {
		name?: string;
		bio?: string;
		profileVisibility?: "PUBLIC" | "PRIVATE" | "CIRCLES_ONLY";
	},
) {
	try {
		const result = await fetchFromBackend(`/users/${userId}/profile`, {
			method: "PUT",
			body: JSON.stringify(data),
		});

		revalidatePath(`/profile`);
		revalidatePath(`/profile/${userId}`);
		return result;
	} catch (err: any) {
		console.error("Failed to update user profile:", err);
		throw new Error(err.message || "Failed to update profile");
	}
}

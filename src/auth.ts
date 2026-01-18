import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { fetchFromBackend } from "@/lib/api";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	callbacks: {
		async jwt({ token, user, trigger }) {
			// When user signs in, sync with backend
			if (user && trigger === "signIn") {
				try {
					console.log("[Auth] Syncing user with backend:", user.id);

					// Generate a temporary JWS for the backend to authorize this sync request
					// Since we are trusted (server-side), we can sign it.
					const { SignJWT } = await import("jose");
					const secret = process.env.NEXTAUTH_SECRET;
					const alg = "HS256";
					const syncToken = await new SignJWT({ sub: user.id || token.sub })
						.setProtectedHeader({ alg })
						.setIssuedAt()
						.setExpirationTime("15m") // Short lived
						.sign(new TextEncoder().encode(secret as string));

					await fetchFromBackend("/auth/sync", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${syncToken}`,
						},
						body: JSON.stringify({
							id: user.id || token.sub,
							name: user.name,
							email: user.email,
							image: user.image,
							emailVerified: null,
						}),
					});
				} catch (e: any) {
					console.error("[Auth] User sync failed:", e);
					throw new Error("Failed to synchronize user with backend");
				}
			}
			// Standard NextAuth logic
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	...authConfig,
});

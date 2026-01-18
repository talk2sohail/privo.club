import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081/api";

export async function fetchFromBackend(
	endpoint: string,
	options: RequestInit = {},
) {
	const cookieStore = await cookies();
	const tokenCookie =
		cookieStore.get("__Secure-authjs.session-token") ||
		cookieStore.get("authjs.session-token") ||
		cookieStore.get("__Secure-next-auth.session-token") ||
		cookieStore.get("next-auth.session-token");
	const token = tokenCookie?.value;

	if (!token) {
		// Fallback or error? For now, let's allow it to proceed potentially without auth
		// if the endpoint is public, but most are protected.
		// Or specific handling.
		console.warn("[API Proxy] No session token found in cookies.");
	}

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const url = `${BACKEND_URL}${endpoint}`;
	console.log(`[API Proxy] Fetching ${url}`);

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error(`[API Proxy] Error ${response.status}: ${errorText}`);
		throw new Error(`Backend Error ${response.status}: ${errorText}`);
	}

	// Handle empty responses (like 204 No Content, or some 200 OK with no body)
	const contentType = response.headers.get("content-type");
	if (contentType && contentType.includes("application/json")) {
		return await response.json();
	}
	return await response.text();
}

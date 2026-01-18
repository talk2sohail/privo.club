import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [Google, GitHub],
    pages: {
        signIn: "/auth/signin",
    },
    session: { strategy: "jwt" },
    jwt: {
        async encode({ token, secret }) {
            const { SignJWT } = await import("jose")
            const alg = 'HS256'
            return new SignJWT(token as any)
                .setProtectedHeader({ alg })
                .setIssuedAt()
                .setExpirationTime('30d')
                .sign(new TextEncoder().encode(secret as string))
        },
        async decode({ token, secret }) {
            const { jwtVerify } = await import("jose")
            const alg = 'HS256'
            if (!token) return null as any;
            try {
                // console.log("Decoding token...", { token: token?.slice(0, 10), secret: !!secret });
                const { payload } = await jwtVerify(
                    token,
                    new TextEncoder().encode(secret as string),
                    { algorithms: [alg] }
                )
                return payload
            } catch (e) {
                console.error("JWT Decode Error:", e);
                return null as any
            }
        }
    },
} satisfies NextAuthConfig

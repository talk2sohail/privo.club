import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [GitHub],
    pages: {
        signIn: "/auth/signin",
    },
} satisfies NextAuthConfig

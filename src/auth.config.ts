import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [Google, GitHub],
    pages: {
        signIn: "/auth/signin",
    },
} satisfies NextAuthConfig

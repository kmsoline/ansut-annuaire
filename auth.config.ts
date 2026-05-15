import type { NextAuthConfig } from "next-auth"

// Edge-compatible config (no Node.js modules) — used by middleware
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = request.nextUrl.pathname.startsWith("/login")
      if (isLoggedIn && isLoginPage) return Response.redirect(new URL("/", request.nextUrl))
      if (!isLoggedIn && !isLoginPage) return Response.redirect(new URL("/login", request.nextUrl))
      return true
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as "admin" | "user" | undefined
      return session
    },
  },
  providers: [], // filled in auth.ts with Node.js providers
  session: { strategy: "jwt" },
}

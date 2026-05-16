import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "@/auth.config"
import { getUserByEmail } from "@/lib/users-db"
import { getEmployees } from "@/lib/employees-db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials.email as string)?.toLowerCase().trim()
        const password = credentials.password as string
        if (!email || !password) return null

        // 0. Admin env-var fallback (works without DB)
        const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminEmails.includes(email) && adminPassword && password === adminPassword) {
          return { id: "admin-env", name: "Administrateur", email, image: null, role: "admin" as const }
        }

        // 1. Individual account (DB)
        try {
          const userRecord = await getUserByEmail(email)
          if (userRecord) {
            const valid = await bcrypt.compare(password, userRecord.passwordHash)
            if (!valid) return null
            const employees = await getEmployees()
            const emp = employees.find((e) => e.email?.toLowerCase() === email)
            return {
              id: userRecord.id,
              name: userRecord.name,
              email: userRecord.email,
              image: emp?.photo ?? null,
              role: userRecord.role,
            }
          }

          // 2. Legacy @ansut.ci fallback (DB)
          if (!email.endsWith("@ansut.ci")) return null
          if (password !== process.env.AUTH_PASSWORD) return null
          const employees = await getEmployees()
          const emp = employees.find((e) => e.email?.toLowerCase() === email)
          if (!emp) return null
          return {
            id: String(emp.id),
            name: emp.nom,
            email: emp.email,
            image: emp.photo ?? null,
            role: "user" as const,
          }
        } catch {
          // DB not reachable — only env-var admin works
          return null
        }
      },
    }),
  ],
})

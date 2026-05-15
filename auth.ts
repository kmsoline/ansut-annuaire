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

        // 1. Individual account
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

        // 2. Legacy fallback
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
      },
    }),
  ],
})

import { auth } from "@/auth"
import { getUsers, createUser, getUserByEmail } from "@/lib/users-db"
import { appendLog } from "@/lib/logs-db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }
  const users = (await getUsers()).map(({ passwordHash: _, ...u }) => u)
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const body = await req.json()
  const { email, name, password, role } = body

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
  }

  const existing = await getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createUser({
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    role: role === "admin" ? "admin" : "user",
  })

  const { passwordHash: _, ...safe } = user
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "create_user", target: user.email })
  return NextResponse.json(safe, { status: 201 })
}

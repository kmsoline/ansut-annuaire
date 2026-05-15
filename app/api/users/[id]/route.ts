import { auth } from "@/auth"
import { updateUser, deleteUser, getUserById, countAdmins } from "@/lib/users-db"
import { appendLog } from "@/lib/logs-db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, role, password } = body

  const updates: Record<string, unknown> = {}
  if (name) updates.name = name.trim()
  if (role) updates.role = role === "admin" ? "admin" : "user"
  if (password) updates.passwordHash = await bcrypt.hash(password, 10)

  // Prevent removing last admin
  if (role === "user") {
    const target = await getUserById(id)
    if (target?.role === "admin" && (await countAdmins()) <= 1) {
      return NextResponse.json({ error: "Impossible de rétrograder le dernier administrateur" }, { status: 400 })
    }
  }

  const updated = await updateUser(id, updates)
  if (!updated) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const { passwordHash: _, ...safe } = updated
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "update_user", target: updated.email })
  return NextResponse.json(safe)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const { id } = await params

  // Prevent deleting last admin
  const target = await getUserById(id)
  if (target?.role === "admin" && (await countAdmins()) <= 1) {
    return NextResponse.json({ error: "Impossible de supprimer le dernier administrateur" }, { status: 400 })
  }

  const ok = await deleteUser(id)
  if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "delete_user", target: target?.email ?? id })
  return NextResponse.json({ ok: true })
}

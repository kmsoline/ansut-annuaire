import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateEmployee, deleteEmployee } from "@/lib/employees-db"
import { appendLog } from "@/lib/logs-db"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const updated = await updateEmployee(Number(id), body)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "update_employee", target: updated.nom ?? id })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const deleted = await deleteEmployee(Number(id))
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "delete_employee", target: deleted.nom ?? id })
  return NextResponse.json({ ok: true })
}

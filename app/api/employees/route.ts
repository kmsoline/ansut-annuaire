import { auth } from "@/auth"
import { getEmployees, createEmployee } from "@/lib/employees-db"
import { appendLog } from "@/lib/logs-db"
import { NextResponse } from "next/server"

export async function GET() {
  const employees = await getEmployees()
  return NextResponse.json(employees)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }
  const body = await req.json()
  const newEmp = await createEmployee({ ...body, favoris: false })
  if (!newEmp) return NextResponse.json({ error: "Erreur base de données" }, { status: 500 })
  await appendLog({ adminEmail: session.user?.email ?? "admin", action: "create_employee", target: newEmp.nom ?? "" })
  return NextResponse.json(newEmp, { status: 201 })
}

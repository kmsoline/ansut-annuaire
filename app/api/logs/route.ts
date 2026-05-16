import { auth } from "@/auth"
import { getLogs } from "@/lib/logs-db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }
  const logs = await getLogs(100)
  return NextResponse.json(logs)
}

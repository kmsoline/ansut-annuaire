import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"

export type LogAction = "create_employee" | "update_employee" | "delete_employee" | "create_user" | "update_user" | "delete_user"

export type LogEntry = {
  id: string
  timestamp: string
  adminEmail: string
  action: LogAction
  target: string
  details?: string
}

function fromJson(): LogEntry[] {
  try {
    const file = path.join(process.cwd(), "data", "logs.json")
    return JSON.parse(fs.readFileSync(file, "utf-8")) as LogEntry[]
  } catch { return [] }
}

export async function appendLog(entry: Omit<LogEntry, "id" | "timestamp">): Promise<void> {
  try {
    await prisma.log.create({
      data: { adminEmail: entry.adminEmail, action: entry.action, target: entry.target, details: entry.details },
    })
  } catch { /* ignore log failures silently */ }
}

export async function getLogs(limit = 100): Promise<LogEntry[]> {
  try {
    const rows = await prisma.log.findMany({ orderBy: { timestamp: "desc" }, take: limit })
    return rows.map((r) => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
      action: r.action as LogAction,
      details: r.details ?? undefined,
    }))
  } catch { return fromJson() }
}

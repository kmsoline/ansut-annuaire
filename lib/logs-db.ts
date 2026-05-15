import { prisma } from "@/lib/prisma"

export type LogAction = "create_employee" | "update_employee" | "delete_employee" | "create_user" | "update_user" | "delete_user"

export type LogEntry = {
  id: string
  timestamp: string
  adminEmail: string
  action: LogAction
  target: string
  details?: string
}

export async function appendLog(entry: Omit<LogEntry, "id" | "timestamp">): Promise<void> {
  await prisma.log.create({
    data: { adminEmail: entry.adminEmail, action: entry.action, target: entry.target, details: entry.details },
  })
}

export async function getLogs(limit = 100): Promise<LogEntry[]> {
  const rows = await prisma.log.findMany({ orderBy: { timestamp: "desc" }, take: limit })
  return rows.map((r) => ({
    ...r,
    timestamp: r.timestamp.toISOString(),
    action: r.action as LogAction,
    details: r.details ?? undefined,
  }))
}

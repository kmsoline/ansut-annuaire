import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export type UserRecord = {
  id: string
  email: string
  name: string
  passwordHash: string
  role: "admin" | "user"
  favorites?: number[]
}

function toRecord(row: { id: string; email: string; name: string; passwordHash: string; role: string; favorites: number[] }): UserRecord {
  return { ...row, role: row.role as "admin" | "user" }
}

export async function getUsers(): Promise<UserRecord[]> {
  const rows = await prisma.user.findMany({ orderBy: { name: "asc" } })
  return rows.map(toRecord)
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const row = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  })
  return row ? toRecord(row) : undefined
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const row = await prisma.user.findUnique({ where: { id } })
  return row ? toRecord(row) : undefined
}

export async function createUser(data: Omit<UserRecord, "id">): Promise<UserRecord> {
  const row = await prisma.user.create({
    data: { id: randomUUID(), email: data.email, name: data.name, passwordHash: data.passwordHash, role: data.role, favorites: data.favorites ?? [] },
  })
  return toRecord(row)
}

export async function updateUser(id: string, data: Partial<Omit<UserRecord, "id">>): Promise<UserRecord | null> {
  try {
    const row = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.favorites !== undefined && { favorites: data.favorites }),
      },
    })
    return toRecord(row)
  } catch { return null }
}

export async function deleteUser(id: string): Promise<boolean> {
  try { await prisma.user.delete({ where: { id } }); return true }
  catch { return false }
}

export async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: "admin" } })
}

export async function getUserFavorites(email: string): Promise<number[]> {
  const user = await getUserByEmail(email)
  return user?.favorites ?? []
}

export async function setUserFavorites(email: string, favorites: number[]): Promise<void> {
  await prisma.user.updateMany({
    where: { email: { equals: email, mode: "insensitive" } },
    data: { favorites },
  })
}

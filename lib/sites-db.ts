import { prisma } from "@/lib/prisma"
import { Site } from "@/lib/types"
import fs from "fs"
import path from "path"

function toSite(row: { id: string; name: string; address: string; lat: number; lng: number; color: string; image: string | null }): Site {
  return { ...row, image: row.image ?? undefined }
}

function fromJson(): Site[] {
  try {
    const file = path.join(process.cwd(), "data", "sites.json")
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Site[]
  } catch { return [] }
}

export async function getSites(): Promise<Site[]> {
  try {
    const rows = await prisma.site.findMany({ orderBy: { name: "asc" } })
    return rows.map(toSite)
  } catch { return fromJson() }
}

export async function getSite(id: string): Promise<Site | null> {
  try {
    const row = await prisma.site.findUnique({ where: { id } })
    return row ? toSite(row) : null
  } catch {
    return fromJson().find((s) => s.id === id) ?? null
  }
}

export async function createSite(data: Site): Promise<Site> {
  const row = await prisma.site.create({
    data: { id: data.id, name: data.name, address: data.address ?? "", lat: data.lat, lng: data.lng, color: data.color ?? "#1d4ed8", image: data.image ?? "" },
  })
  return toSite(row)
}

export async function updateSite(id: string, data: Partial<Site>): Promise<Site | null> {
  try {
    const row = await prisma.site.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.lat !== undefined && { lat: data.lat }),
        ...(data.lng !== undefined && { lng: data.lng }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.image !== undefined && { image: data.image }),
      },
    })
    return toSite(row)
  } catch { return null }
}

export async function deleteSite(id: string): Promise<boolean> {
  try { await prisma.site.delete({ where: { id } }); return true }
  catch { return false }
}

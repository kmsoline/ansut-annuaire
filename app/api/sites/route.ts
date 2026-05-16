import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getSites, createSite, getSite } from "@/lib/sites-db"
import { Site } from "@/lib/types"

export async function GET() {
  const sites = await getSites()
  return NextResponse.json(sites)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { id, name, address, lat, lng, color } = body

  if (!id || !name || lat == null || lng == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const existing = await getSite(id)
  if (existing) {
    return NextResponse.json({ error: "ID already exists" }, { status: 409 })
  }

  const newSite: Site = { id, name, address: address ?? "", lat: Number(lat), lng: Number(lng), color: color ?? "#1d4ed8", ...(body.image ? { image: body.image } : {}) }
  const created = await createSite(newSite)
  if (!created) return NextResponse.json({ error: "Erreur base de données" }, { status: 500 })
  return NextResponse.json(created, { status: 201 })
}

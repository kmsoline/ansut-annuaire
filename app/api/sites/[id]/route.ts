import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getSite, updateSite, deleteSite } from "@/lib/sites-db"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const existing = await getSite(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await updateSite(id, {
    name: body.name ?? existing.name,
    address: body.address ?? existing.address,
    lat: body.lat != null ? Number(body.lat) : existing.lat,
    lng: body.lng != null ? Number(body.lng) : existing.lng,
    color: body.color ?? existing.color,
    image: body.image !== undefined ? body.image : existing.image,
  })

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const ok = await deleteSite(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

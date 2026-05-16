import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté (JPG, PNG, WEBP, GIF)" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const filename = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const blob = await put(filename, file, { access: "public" })
  return NextResponse.json({ url: blob.url })
}

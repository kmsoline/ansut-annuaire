import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserFavorites, setUserFavorites } from "@/lib/users-db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const favorites = await getUserFavorites(session.user.email)
  return NextResponse.json({ favorites })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { favorites } = await req.json() as { favorites: number[] }
  if (!Array.isArray(favorites)) return NextResponse.json({ error: "Invalid" }, { status: 400 })
  await setUserFavorites(session.user.email, favorites)
  return NextResponse.json({ favorites })
}

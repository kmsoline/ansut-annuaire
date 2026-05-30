import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyJWT(token.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: payload.sub, email: payload.email, role: payload.role },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge-compatible middleware — pas de jose/next-auth dans l'edge runtime
// La validation complète de la session se fait dans les Server Components (auth())
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Cookie session next-auth v5 (http = authjs.session-token, https = __Secure-authjs.session-token)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value

  const isLoginPage = pathname.startsWith("/login")

  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|photos|logo\\.png).*)"],
}

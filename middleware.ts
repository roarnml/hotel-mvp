// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ROLE_ACCESS: Record<string, string[]> = {
  SUPER_USER: ["/super", "/admin", "/staff"],
  ADMIN: ["/admin", "/staff"],
  STAFF: ["/staff"],
}

const PUBLIC_ROUTES = ["/login", "/api", "/unauthorized"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1️⃣ Allow public routes immediately
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 2️⃣ Get auth token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 3️⃣ Block unauthenticated access to protected areas
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = token.role as keyof typeof ROLE_ACCESS

  // 4️⃣ Unknown / corrupted role → hard stop
  if (!role || !ROLE_ACCESS[role]) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  // 5️⃣ Role-based access check
  const allowedPaths = ROLE_ACCESS[role]
  const hasAccess = allowedPaths.some((basePath) =>
    pathname.startsWith(basePath)
  )

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/super/:path*"],
}

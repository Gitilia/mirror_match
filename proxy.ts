import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { SESSION_COOKIE_NAME } from "./lib/constants"
import { logActivity } from "./lib/activity-log"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - allow access
  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/uploads")) {
    return NextResponse.next()
  }

  // Get token (works in Edge runtime)
  // Use constant for cookie name to match NextAuth config
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: SESSION_COOKIE_NAME
  })
  
  // User activity logging - track all page visits and API calls
  // Uses structured logging with log levels (INFO level, can be filtered)
  const user = token ? {
    id: token.id as string,
    email: token.email as string,
    role: token.role as string,
  } : null

  const referer = request.headers.get("referer") || "direct"
  const userAgent = request.headers.get("user-agent") || "unknown"
  
  logActivity(
    token ? "PAGE_VIEW" : "UNAUTHENTICATED_ACCESS",
    pathname,
    request.method,
    user,
    {
      referer,
      userAgent: userAgent.substring(0, 100), // Limit length
    },
    request
  )

  // Protected routes - require authentication
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes - require ADMIN role
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/rsc (RSC payload requests)
     * - _next/webpack (webpack chunks)
     * - favicon.ico (favicon file)
     * - uploads/ (uploaded files)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|_next/rsc|_next/webpack|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

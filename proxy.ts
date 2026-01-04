import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - allow access
  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/uploads")) {
    return NextResponse.next()
  }

  // Get token (works in Edge runtime)
  // Explicitly specify the cookie name to match NextAuth config
  const cookieName = "__Secure-authjs.session-token"
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: cookieName
  })
  
  // User activity logging - track all page visits and API calls
  const timestamp = new Date().toISOString()
  const userAgent = request.headers.get("user-agent") || "unknown"
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown"
  const referer = request.headers.get("referer") || "direct"
  const method = request.method
  
  if (token) {
    // Log authenticated user activity
    console.log(`[ACTIVITY] ${timestamp} | ${method} ${pathname} | User: ${token.email} (${token.role}) | IP: ${ip} | Referer: ${referer}`)
  } else {
    // Log unauthenticated access attempts
    console.log(`[ACTIVITY] ${timestamp} | ${method} ${pathname} | User: UNAUTHENTICATED | IP: ${ip} | Referer: ${referer} | UA: ${userAgent.substring(0, 100)}`)
  }

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

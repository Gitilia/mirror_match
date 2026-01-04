import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - allow access
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
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
  
  // Debug logging for production troubleshooting
  const cookieHeader = request.headers.get("cookie") || ""
  const hasCookie = cookieHeader.includes(cookieName)
  
  if (!token) {
    console.log("Middleware: No token found", {
      pathname,
      cookieName,
      hasCookie,
      cookieHeader: cookieHeader.substring(0, 300),
      allCookies: cookieHeader.split(";").map(c => c.trim().substring(0, 50)),
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer")
    })
  } else {
    console.log("Middleware: Token found", {
      pathname,
      tokenId: token.id,
      tokenRole: token.role,
      tokenEmail: token.email
    })
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
     * - public folder
     */
    "/((?!_next/static|_next/image|_next/rsc|_next/webpack|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

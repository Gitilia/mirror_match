import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME } from "@/lib/constants"
import { logger } from "@/lib/logger"

/**
 * Debug endpoint for session inspection
 * ADMIN ONLY - Protected endpoint for debugging session issues
 * 
 * This endpoint should only be accessible to administrators.
 * Consider removing in production or restricting further.
 */
export async function GET(request: Request) {
  try {
    // Require admin authentication
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      logger.warn("Unauthorized access attempt to debug endpoint", {
        userId: session?.user?.id,
        userRole: session?.user?.role,
        path: "/api/debug/session",
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const cookieHeader = request.headers.get("cookie") || ""
    
    // Parse cookies from header first
    const cookieMap: Record<string, string> = {}
    cookieHeader.split(";").forEach(cookie => {
      const [key, value] = cookie.trim().split("=")
      if (key && value) {
        cookieMap[key] = decodeURIComponent(value)
      }
    })
    
    // Try to get session token from cookies
    const sessionTokenFromHeader = cookieMap[SESSION_COOKIE_NAME] || "NOT FOUND"
    
    // Try to call auth() again for debugging (we already have session above, but this is for testing)
    let authError = null
    try {
      // Already called above, but keeping for backward compatibility in response
      logger.debug("Debug endpoint: Session retrieved", {
        hasSession: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role,
      })
    } catch (err) {
      authError = err instanceof Error ? err.message : String(err)
      logger.error("Debug endpoint: auth() error", {
        error: err instanceof Error ? err : new Error(String(err)),
      })
    }
    
    // Try to get cookie from Next.js cookie store
    let sessionTokenFromStore = "NOT ACCESSIBLE"
    try {
      const cookieStore = await cookies()
      sessionTokenFromStore = cookieStore.get(SESSION_COOKIE_NAME)?.value || "NOT FOUND"
    } catch {
      // Cookie store might not be accessible in all contexts
    }
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      authError,
      cookies: {
        sessionTokenInHeader: sessionTokenFromHeader !== "NOT FOUND",
        sessionTokenInStore: sessionTokenFromStore !== "NOT FOUND" && sessionTokenFromStore !== "NOT ACCESSIBLE",
        sessionTokenPreview: sessionTokenFromHeader !== "NOT FOUND" ? `${sessionTokenFromHeader.substring(0, 30)}...` : "NOT FOUND",
        allCookieKeys: Object.keys(cookieMap),
        cookieHeaderLength: cookieHeader.length,
        cookieHeaderPreview: cookieHeader.substring(0, 200),
      },
      env: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        authTrustHost: process.env.AUTH_TRUST_HOST,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        secretPreview: process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 10)}...` : "missing",
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

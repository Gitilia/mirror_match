import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
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
    const sessionTokenFromHeader = cookieMap["__Secure-authjs.session-token"] || "NOT FOUND"
    
    // Try to call auth() - this might fail or return null
    let session = null
    let authError = null
    try {
      console.log("Debug endpoint: Calling auth()...")
      session = await auth()
      console.log("Debug endpoint: auth() returned", {
        hasSession: !!session,
        sessionUser: session?.user,
        sessionKeys: session ? Object.keys(session) : []
      })
    } catch (err) {
      authError = err instanceof Error ? err.message : String(err)
      console.error("Debug endpoint: auth() error", authError)
    }
    
    // Try to get cookie from Next.js cookie store
    let sessionTokenFromStore = "NOT ACCESSIBLE"
    try {
      const cookieStore = await cookies()
      sessionTokenFromStore = cookieStore.get("__Secure-authjs.session-token")?.value || "NOT FOUND"
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

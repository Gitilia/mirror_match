import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const cookieStore = await cookies()
    const cookieHeader = request.headers.get("cookie") || ""
    
    // Parse cookies from header
    const cookieMap: Record<string, string> = {}
    cookieHeader.split(";").forEach(cookie => {
      const [key, value] = cookie.trim().split("=")
      if (key && value) {
        cookieMap[key] = decodeURIComponent(value)
      }
    })
    
    const sessionToken = cookieStore.get("__Secure-authjs.session-token")?.value || 
                         cookieMap["__Secure-authjs.session-token"] || 
                         "NOT FOUND"
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      cookies: {
        sessionTokenPresent: !!sessionToken && sessionToken !== "NOT FOUND",
        sessionTokenPreview: sessionToken !== "NOT FOUND" ? `${sessionToken.substring(0, 20)}...` : "NOT FOUND",
        allCookieKeys: Object.keys(cookieMap),
        cookieHeaderLength: cookieHeader.length,
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

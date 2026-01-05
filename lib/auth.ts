import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { logger } from "./logger"

const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not set. Define it to enable authentication.")
}

// Determine if we should use secure cookies based on AUTH_URL/NEXTAUTH_URL
// Auth.js v5 derives this from the origin it detects, so we need to be explicit
const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
const isHttp = authUrl.startsWith("http://")

export const { handlers, auth, signIn, signOut } = NextAuth({
  // trustHost must be true for NextAuth v5 to work, even on localhost
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  basePath: "/api/auth",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.passwordHash)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (err) {
          logger.error("Auth authorize error", err instanceof Error ? err : new Error(String(err)))
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.email = user.email
        token.name = user.name
        // DEBUG level: only logs in development or when LOG_LEVEL=DEBUG
        logger.debug("JWT callback: user added to token", { 
          userId: user.id, 
          email: user.email 
        })
      } else {
        // DEBUG level: token refresh (normal operation, only log in debug mode)
        logger.debug("JWT callback: token refresh", { 
          hasToken: !!token,
          tokenId: token?.id,
          tokenEmail: token?.email,
        })
      }
      return token
    },
    async session({ session, token }) {
      // Always ensure session.user exists when token exists
      if (token && (token.id || token.email)) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: (token.email as string) || session.user?.email || "",
          name: (token.name as string) || session.user?.name || "",
          role: token.role as string,
        }
        // DEBUG level: session creation is normal operation, only log in debug mode
        logger.debug("Session callback: session created", { 
          userId: token.id, 
          email: token.email,
          userRole: token.role,
        })
      } else {
        // WARN level: token missing/invalid is a warning condition
        logger.warn("Session callback: token missing or invalid", { 
          hasToken: !!token,
          hasSession: !!session,
          tokenId: token?.id,
          tokenEmail: token?.email
        })
        // Return session even if token is invalid - NextAuth will handle validation
      }
      // Explicitly return session to ensure it's returned
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Explicitly configure cookies for HTTP (localhost)
  // For HTTPS, let Auth.js defaults handle it (prefixes + Secure)
  cookies: isHttp
    ? {
        // localhost / pure HTTP: no prefixes, no Secure
        sessionToken: {
          name: "authjs.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false,
          },
        },
        csrfToken: {
          name: "authjs.csrf-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false,
          },
        },
        callbackUrl: {
          name: "authjs.callback-url",
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false,
          },
        },
      }
    : undefined, // Let Auth.js defaults handle HTTPS envs (prefixes + Secure)
  secret: nextAuthSecret,
})

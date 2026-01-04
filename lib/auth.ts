import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not set. Define it to enable authentication.")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
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
          console.error("Auth authorize error:", err)
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
        console.log("JWT callback: user added to token", { userId: user.id, email: user.email })
      } else {
        console.log("JWT callback: no user, token exists", { 
          hasToken: !!token,
          tokenKeys: token ? Object.keys(token) : []
        })
      }
      return token
    },
    async session({ session, token }) {
      // Always ensure session.user exists when token exists
      if (token && (token.id || token.email)) {
        // Ensure session.user is always an object
        if (!session.user) {
          session.user = {} as any
        }
        session.user = {
          ...session.user,
          id: token.id as string,
          email: (token.email as string) || session.user?.email || "",
          name: (token.name as string) || session.user?.name || "",
          role: token.role as string,
        }
        console.log("Session callback: session created", { 
          userId: token.id, 
          email: token.email,
          hasUser: !!session.user,
          userKeys: session.user ? Object.keys(session.user) : [],
          userRole: token.role,
          sessionUser: session.user,
          sessionExpires: session.expires,
          fullSession: JSON.stringify(session, null, 2)
        })
      } else {
        console.warn("Session callback: token missing or invalid", { 
          hasToken: !!token,
          tokenKeys: token ? Object.keys(token) : [],
          hasSession: !!session,
          sessionKeys: session ? Object.keys(session) : [],
          sessionUser: session?.user,
          tokenId: token?.id,
          tokenEmail: token?.email
        })
      }
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
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // Always secure in production (HTTPS required)
      },
    },
  },
  secret: nextAuthSecret,
})

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { hashPassword } from "@/lib/utils"

// Mark this route as dynamic to prevent build-time data collection
export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  let userId: string | undefined
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    userId = (await params).userId
    const { password } = await req.json()

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error resetting password", {
      userId,
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

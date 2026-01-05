import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Mark this route as dynamic to prevent build-time data collection
export const dynamic = "force-dynamic"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete photos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete photos" },
        { status: 403 }
      )
    }

    const { photoId } = await params

    // Find the photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Delete all guesses associated with this photo first
    await prisma.guess.deleteMany({
      where: { photoId: photoId },
    })

    // Delete the photo file if it's a local upload (starts with /uploads/)
    if (photo.url.startsWith("/uploads/")) {
      const filepath = join(process.cwd(), "public", photo.url)
      if (existsSync(filepath)) {
        try {
          await unlink(filepath)
        } catch (error) {
          logger.error("Failed to delete file", {
            filepath,
            error: error instanceof Error ? error : new Error(String(error)),
          })
          // Continue with database deletion even if file deletion fails
        }
      }
    }

    // Delete the photo
    await prisma.photo.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ success: true, message: "Photo deleted successfully" })
  } catch (error) {
    logger.error("Error deleting photo", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewPhotoEmail } from "@/lib/email"
import { logActivity } from "@/lib/activity-log"
import { logger } from "@/lib/logger"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"
import { createHash } from "crypto"

// Mark this route as dynamic to prevent build-time data collection
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const answerName = formData.get("answerName") as string | null
    const pointsStr = formData.get("points") as string | null
    const maxAttemptsStr = (formData.get("maxAttempts") as string)?.trim() || ""

    if (!answerName) {
      return NextResponse.json(
        { error: "Answer name is required" },
        { status: 400 }
      )
    }

    // Validate points (must be positive integer, default to 1)
    const pointsValue = pointsStr ? Math.max(1, parseInt(pointsStr, 10)) : 1
    const maxAttemptsValue = maxAttemptsStr && parseInt(maxAttemptsStr, 10) > 0 
      ? parseInt(maxAttemptsStr, 10) 
      : null

    let photoUrl: string
    let fileHash: string | null = null

    if (file) {
      // Handle file upload
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "File must be an image" },
          { status: 400 }
        )
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 10MB" },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Calculate SHA256 hash for duplicate detection
      fileHash = createHash("sha256").update(buffer).digest("hex")

      // Check for duplicate file
      const existingPhoto = await prisma.photo.findFirst({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { fileHash } as any,
      })

      if (existingPhoto) {
        return NextResponse.json(
          { error: "This photo has already been uploaded (duplicate file detected)" },
          { status: 409 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      // Sanitize extension - only allow alphanumeric characters
      const rawExtension = file.name.split(".").pop() || "jpg"
      const extension = rawExtension.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg"
      const filename = `${timestamp}-${randomStr}.${extension}`

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
        // DEBUG level: directory creation is normal operation
        logger.debug("Created uploads directory", { path: uploadsDir })
      }

      // Filename is generated server-side (timestamp + random), safe for path.join
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      
      // Verify file was written successfully
      const { access } = await import("fs/promises")
      try {
        await access(filepath)
        // DEBUG level: file save verification is normal operation
        logger.debug("File saved successfully", { filepath })
      } catch (error) {
        // ERROR level: file write failure is an error condition
        logger.error("File write verification failed", {
          filepath,
          error: error instanceof Error ? error : new Error(String(error)),
        })
        throw new Error("Failed to save file to disk")
      }

      // Set URL to the uploaded file - use API route to ensure it's accessible
      photoUrl = `/api/uploads/${filename}`
    } else {
      // Handle URL upload (fallback)
      const url = formData.get("url") as string | null
      if (!url) {
        return NextResponse.json(
          { error: "Either file or URL is required" },
          { status: 400 }
        )
      }
      photoUrl = url

      // Check for duplicate URL
      const existingPhoto = await prisma.photo.findFirst({
        where: { url: photoUrl },
      })

      if (existingPhoto) {
        return NextResponse.json(
          { error: "This photo URL has already been uploaded (duplicate URL detected)" },
          { status: 409 }
        )
      }
    }

    const photo = await prisma.photo.create({
      data: {
        uploaderId: session.user.id,
        url: photoUrl,
        fileHash,
        answerName: answerName.trim(),
        points: pointsValue,
        maxAttempts: maxAttemptsValue,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
      },
    })

    // Send emails to all other users
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Send emails asynchronously (don't wait for them)
    Promise.all(
      allUsers.map((user: { id: string; email: string; name: string }) =>
        sendNewPhotoEmail(user.email, user.name, photo.id, photo.uploader.name).catch(
          (err) => {
            logger.error("Failed to send email", {
              email: user.email,
              photoId: photo.id,
              error: err instanceof Error ? err : new Error(String(err)),
            })
          }
        )
      )
    )

    // Log photo upload activity
    logActivity(
      "PHOTO_UPLOAD",
      "/api/photos/upload",
      "POST",
      session.user,
      {
        photoId: photo.id,
        answerName: photo.answerName,
        points: photo.points,
        filename: photoUrl.split("/").pop()
      },
      req
    )

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    logger.error("Error uploading photo", {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

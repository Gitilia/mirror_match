import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewPhotoEmail } from "@/lib/email"

// Legacy endpoint for URL-based uploads (kept for backward compatibility)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { url, answerName, points, maxAttempts } = await req.json()

    if (!url || !answerName) {
      return NextResponse.json(
        { error: "URL and answer name are required" },
        { status: 400 }
      )
    }

    // Validate points (must be positive integer, default to 1)
    const pointsValue = points ? Math.max(1, parseInt(points, 10)) : 1
    const maxAttemptsValue = maxAttempts && parseInt(maxAttempts, 10) > 0 
      ? parseInt(maxAttempts, 10) 
      : null

    // Check for duplicate URL
    const existingPhoto = await prisma.photo.findFirst({
      where: { url },
    })

    if (existingPhoto) {
      return NextResponse.json(
        { error: "This photo URL has already been uploaded (duplicate URL detected)" },
        { status: 409 }
      )
    }

    const photo = await prisma.photo.create({
      data: {
        uploaderId: session.user.id,
        url,
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
            console.error("Failed to send email to:", user.email, err)
          }
        )
      )
    )

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Error creating photo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

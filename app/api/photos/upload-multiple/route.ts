import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewPhotoEmail } from "@/lib/email"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"
import { createHash } from "crypto"
import type { Prisma } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please log out and log back in." },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const count = parseInt(formData.get("count") as string, 10)

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Invalid photo count" },
        { status: 400 }
      )
    }

    const uploadsDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    type PhotoWithUploader = Prisma.PhotoGetPayload<{
      include: { uploader: { select: { name: true } } }
    }>
    
    const createdPhotos: PhotoWithUploader[] = []

    for (let i = 0; i < count; i++) {
      const answerName = (formData.get(`photo_${i}_answerName`) as string)?.trim()
      const pointsStr = (formData.get(`photo_${i}_points`) as string) || "1"
      const pointsValue = Math.max(1, parseInt(pointsStr, 10))
      const penaltyEnabled = formData.get(`photo_${i}_penaltyEnabled`) === "true"
      const penaltyPointsStr = (formData.get(`photo_${i}_penaltyPoints`) as string) || "0"
      const penaltyPointsValue = Math.max(0, parseInt(penaltyPointsStr, 10))
      const maxAttemptsStr = (formData.get(`photo_${i}_maxAttempts`) as string)?.trim() || ""
      const maxAttemptsValue = maxAttemptsStr && parseInt(maxAttemptsStr, 10) > 0 
        ? parseInt(maxAttemptsStr, 10) 
        : null

      if (!answerName) {
        return NextResponse.json(
          { error: `Photo ${i + 1}: Answer name is required` },
          { status: 400 }
        )
      }

      const file = formData.get(`photo_${i}_file`) as File | null
      const url = (formData.get(`photo_${i}_url`) as string)?.trim() || null

      if (!file && !url) {
        return NextResponse.json(
          { error: `Photo ${i + 1}: File or URL is required` },
          { status: 400 }
        )
      }

      let photoUrl: string
      let fileHash: string | null = null

      if (file) {
        // Handle file upload
        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            { error: `Photo ${i + 1}: File must be an image` },
            { status: 400 }
          )
        }

        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: `Photo ${i + 1}: File size must be less than 10MB` },
            { status: 400 }
          )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Calculate SHA256 hash for duplicate detection
        fileHash = createHash("sha256").update(buffer).digest("hex")

        // Check for duplicate file
        const existingPhoto = await prisma.photo.findFirst({
          where: { fileHash } as Prisma.PhotoWhereInput,
        })

        if (existingPhoto) {
          return NextResponse.json(
            { error: `Photo ${i + 1}: This photo has already been uploaded (duplicate file detected)` },
            { status: 409 }
          )
        }

        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 15)
        const extension = file.name.split(".").pop() || "jpg"
        const filename = `${timestamp}-${i}-${randomStr}.${extension}`

        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        photoUrl = `/uploads/${filename}`
      } else if (url) {
        // Handle URL upload
        photoUrl = url

        // Check for duplicate URL
        const existingPhoto = await prisma.photo.findFirst({
          where: { url: photoUrl },
        })

        if (existingPhoto) {
          return NextResponse.json(
            { error: `Photo ${i + 1}: This photo URL has already been uploaded (duplicate URL detected)` },
            { status: 409 }
          )
        }
      } else {
        return NextResponse.json(
          { error: `Photo ${i + 1}: File or URL is required` },
          { status: 400 }
        )
      }

      // Create photo record
      const photo = await prisma.photo.create({
        data: {
          uploaderId: session.user.id,
          url: photoUrl,
          fileHash,
          answerName,
          points: pointsValue,
          penaltyEnabled: penaltyEnabled,
          penaltyPoints: penaltyPointsValue,
          maxAttempts: maxAttemptsValue,
        } as Prisma.PhotoUncheckedCreateInput,
        include: {
          uploader: {
            select: {
              name: true,
            },
          },
        },
      })

      createdPhotos.push(photo)
    }

    // Send emails to all other users for all photos
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

    // Send emails asynchronously for all photos
    Promise.all(
      allUsers.map((user: { id: string; email: string; name: string }) =>
        Promise.all(
          createdPhotos.map((photo: PhotoWithUploader) =>
            sendNewPhotoEmail(
              user.email,
              user.name,
              photo.id,
              photo.uploader.name
            ).catch((err) =>
              console.error(
                `Failed to send email to ${user.email} for photo ${photo.id}:`,
                err
              )
            )
          )
        )
      )
    )

    return NextResponse.json(
      { photos: createdPhotos, count: createdPhotos.length },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error uploading photos:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

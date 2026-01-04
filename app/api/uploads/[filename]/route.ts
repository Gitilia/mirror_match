import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Sanitize filename - only allow alphanumeric, dots, hyphens
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }
    
    // Get the uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads")
    const filepath = join(uploadsDir, filename)
    
    // Security: ensure file is within uploads directory (prevent path traversal)
    if (!filepath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }
    
    // Check if file exists
    if (!existsSync(filepath)) {
      console.error(`[UPLOAD] File not found: ${filepath} (cwd: ${process.cwd()})`)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    
    // Read and serve the file
    const fileBuffer = await readFile(filepath)
    
    // Determine content type from extension
    const ext = filename.split(".").pop()?.toLowerCase()
    const contentType = 
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
      ext === "png" ? "image/png" :
      ext === "gif" ? "image/gif" :
      ext === "webp" ? "image/webp" :
      "application/octet-stream"
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[UPLOAD] Error serving file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

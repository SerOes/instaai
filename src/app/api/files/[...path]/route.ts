import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import path from "path"

// MIME types mapping
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
}

/**
 * GET /api/files/[...path]
 * Serves uploaded files from the uploads directory
 * This is needed because Next.js standalone mode doesn't serve
 * dynamically uploaded files from public/uploads
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "No path specified" }, { status: 400 })
    }

    // Build the file path
    const filePath = pathSegments.join("/")
    
    // Security: prevent directory traversal
    if (filePath.includes("..") || filePath.includes("~")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    // Full path to the file
    const fullPath = path.join(process.cwd(), "public", "uploads", filePath)

    // Check if file exists
    try {
      const fileStat = await stat(fullPath)
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: "Not a file" }, { status: 404 })
      }
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type
    const ext = path.extname(fullPath).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

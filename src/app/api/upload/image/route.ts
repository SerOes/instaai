import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/upload/image
 * Uploads an image file and creates a MediaProject entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Erlaubt: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Datei zu groß. Maximum: 10MB" },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filename = `${session.user.id}-${timestamp}-${randomSuffix}.${extension}`
    const thumbnailFilename = `${session.user.id}-${timestamp}-${randomSuffix}-thumb.webp`

    // Ensure upload directories exist
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails")
    
    await mkdir(uploadDir, { recursive: true })
    await mkdir(thumbnailDir, { recursive: true })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save original file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Create thumbnail with Sharp
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(thumbnailPath)

    // Get image metadata
    const metadata = await sharp(buffer).metadata()
    const aspectRatio = metadata.width && metadata.height 
      ? `${metadata.width}:${metadata.height}`
      : "1:1"

    // Create MediaProject entry
    const project = await prisma.mediaProject.create({
      data: {
        userId: session.user.id,
        type: "IMAGE",
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        status: "COMPLETED",
        source: "UPLOADED",
        fileUrl: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        aspectRatio: aspectRatio,
        metadata: JSON.stringify({
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          width: metadata.width,
          height: metadata.height,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        fileUrl: project.fileUrl,
        thumbnailUrl: project.thumbnailUrl,
        aspectRatio: project.aspectRatio,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Fehler beim Hochladen" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload/image
 * Returns all uploaded images for the current user
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const images = await prisma.mediaProject.findMany({
      where: {
        userId: session.user.id,
        type: "IMAGE",
        source: {
          in: ["UPLOADED", "GENERATED"]
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        thumbnailUrl: true,
        aspectRatio: true,
        createdAt: true,
        metadata: true,
        source: true,
        prompt: true,
        model: true,
        provider: true,
      },
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching uploaded images:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Bilder" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload/image
 * Deletes an uploaded image
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    if (!projectId) {
      return NextResponse.json({ error: "Projekt-ID erforderlich" }, { status: 400 })
    }

    // Find the project and verify ownership
    const project = await prisma.mediaProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
        source: "UPLOADED",
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Bild nicht gefunden" }, { status: 404 })
    }

    // Delete files from filesystem
    const { unlink } = await import("fs/promises")
    
    if (project.fileUrl) {
      const filePath = path.join(process.cwd(), "public", project.fileUrl)
      try {
        await unlink(filePath)
      } catch {
        console.warn("Could not delete file:", filePath)
      }
    }

    if (project.thumbnailUrl) {
      const thumbnailPath = path.join(process.cwd(), "public", project.thumbnailUrl)
      try {
        await unlink(thumbnailPath)
      } catch {
        console.warn("Could not delete thumbnail:", thumbnailPath)
      }
    }

    // Delete database entry
    await prisma.mediaProject.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Fehler beim Löschen" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

/**
 * POST /api/upload/save-generated
 * Saves a generated image from URL to user's gallery
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, title, prompt, model, provider, presetId, aspectRatio } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Bild-URL erforderlich" }, { status: 400 })
    }

    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 400 })
    }

    const contentType = imageResponse.headers.get("content-type") || "image/png"
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Determine file extension based on content type
    let extension = "png"
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      extension = "jpg"
    } else if (contentType.includes("webp")) {
      extension = "webp"
    } else if (contentType.includes("gif")) {
      extension = "gif"
    }

    // Create unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const filename = `${session.user.id}-gen-${timestamp}-${randomSuffix}.${extension}`
    const thumbnailFilename = `${session.user.id}-gen-${timestamp}-${randomSuffix}-thumb.webp`

    // Ensure upload directories exist
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails")
    
    await mkdir(uploadDir, { recursive: true })
    await mkdir(thumbnailDir, { recursive: true })

    // Save original file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, imageBuffer)

    // Create thumbnail with Sharp
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(thumbnailPath)

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const detectedAspectRatio = metadata.width && metadata.height 
      ? `${metadata.width}:${metadata.height}`
      : aspectRatio || "1:1"

    // Create MediaProject entry
    const project = await prisma.mediaProject.create({
      data: {
        userId: session.user.id,
        type: "IMAGE",
        title: title || `Generiertes Bild ${new Date().toLocaleDateString('de-DE')}`,
        status: "COMPLETED",
        source: "GENERATED",
        fileUrl: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        aspectRatio: aspectRatio || detectedAspectRatio,
        prompt: prompt || undefined,
        model: model || undefined,
        provider: provider || undefined,
        presetId: presetId || undefined,
        metadata: JSON.stringify({
          originalUrl: imageUrl,
          mimeType: contentType,
          size: imageBuffer.length,
          width: metadata.width,
          height: metadata.height,
          savedAt: new Date().toISOString(),
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
    console.error("Save generated image error:", error)
    return NextResponse.json(
      { error: "Fehler beim Speichern des Bildes" },
      { status: 500 }
    )
  }
}

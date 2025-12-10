import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Schema for saving a generated video
const saveVideoSchema = z.object({
  videoUrl: z.string().url("Gültige Video-URL erforderlich"),
  prompt: z.string().optional(),
  title: z.string().min(1, "Titel erforderlich").default("Generiertes Video"),
  description: z.string().optional(),
  aspectRatio: z.enum(["1:1", "9:16", "16:9"]).optional(),
  duration: z.number().min(1).max(60).optional(),
  resolution: z.enum(["480p", "720p", "1080p"]).optional(),
  model: z.string().optional(),
  provider: z.enum(["kieai", "gemini-direct"]).optional(),
  presetId: z.string().cuid().optional(),
  taskId: z.string().optional(), // Original task ID from generation
  metadata: z.record(z.string(), z.unknown()).optional(), // Additional metadata
})

// POST /api/projects/video - Save a generated video as a project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = saveVideoSchema.parse(body)

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadsDir, { recursive: true })

    // Download the video from the URL
    let localFileUrl = data.videoUrl
    let thumbnailUrl: string | undefined

    try {
      const videoResponse = await fetch(data.videoUrl)
      
      if (videoResponse.ok) {
        const videoBuffer = await videoResponse.arrayBuffer()
        const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`
        const filePath = path.join(uploadsDir, fileName)
        
        // Save video locally
        await writeFile(filePath, Buffer.from(videoBuffer))
        // Use /api/files/ endpoint to serve uploaded files (works in Next.js standalone mode)
        localFileUrl = `/api/files/videos/${fileName}`

        // Try to generate a thumbnail
        // For now, we'll use a placeholder or first frame extraction later
        // This can be enhanced with ffmpeg or a video processing library
        thumbnailUrl = await generateVideoThumbnail(filePath, uploadsDir, fileName)
      }
    } catch (downloadError) {
      console.error("Error downloading video:", downloadError)
      // Continue with the original URL if download fails
    }

    // Build metadata JSON string
    const metadataJson = JSON.stringify({
      originalUrl: data.videoUrl,
      taskId: data.taskId,
      generatedAt: new Date().toISOString(),
      ...data.metadata,
    })

    // Create the media project
    const project = await prisma.mediaProject.create({
      data: {
        userId: session.user.id,
        type: "VIDEO",
        title: data.title,
        description: data.description || data.prompt?.substring(0, 200),
        status: "DRAFT",
        source: "GENERATED",
        fileUrl: localFileUrl,
        thumbnailUrl,
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        model: data.model,
        provider: data.provider,
        presetId: data.presetId,
        videoDuration: data.duration,
        videoResolution: data.resolution,
        videoProvider: data.provider,
        metadata: metadataJson,
      },
    })

    return NextResponse.json({ 
      message: "Video erfolgreich gespeichert",
      project: {
        id: project.id,
        title: project.title,
        fileUrl: project.fileUrl,
        thumbnailUrl: project.thumbnailUrl,
        status: project.status,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error saving video project:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Speichern des Videos" }, { status: 500 })
  }
}

// GET /api/projects/video - Get all video projects for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {
      userId: session.user.id,
      type: "VIDEO",
    }

    if (status && ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"].includes(status)) {
      where.status = status
    }

    const [projects, total] = await Promise.all([
      prisma.mediaProject.findMany({
        where,
        include: {
          captions: {
            where: { isSelected: true },
            take: 1,
          },
          postSchedules: {
            orderBy: { scheduledAt: "asc" },
            take: 1,
          },
          preset: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.mediaProject.count({ where }),
    ])

    // Parse metadata for each project
    const projectsWithParsedMeta = projects.map(project => ({
      ...project,
      metadata: project.metadata ? JSON.parse(project.metadata) : null,
    }))

    return NextResponse.json({ 
      projects: projectsWithParsedMeta,
      total,
      limit,
      offset,
    })

  } catch (error) {
    console.error("Error fetching video projects:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Video-Projekte" }, { status: 500 })
  }
}

// Helper function to generate video thumbnail
// This is a basic implementation - can be enhanced with ffmpeg
async function generateVideoThumbnail(
  videoPath: string, 
  outputDir: string, 
  originalName: string
): Promise<string | undefined> {
  try {
    // For now, we'll create a placeholder thumbnail
    // In production, you'd use ffmpeg to extract the first frame
    // Example with ffmpeg:
    // ffmpeg -i input.mp4 -ss 00:00:01 -frames:v 1 -vf "scale=320:-1" thumbnail.jpg

    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails")
    await mkdir(thumbnailDir, { recursive: true })

    // Try to use sharp to create a placeholder if video-thumbnails is not available
    // For a full implementation, you'd integrate ffmpeg or a cloud service
    
    // Placeholder approach - return undefined for now
    // The frontend can display a video icon or first frame when playing
    console.log("Thumbnail generation skipped for:", videoPath, originalName)
    
    return undefined
  } catch (error) {
    console.error("Error generating thumbnail:", error)
    return undefined
  }
}

// PATCH /api/projects/video - Update a video project
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, ...updates } = body

    if (!projectId) {
      return NextResponse.json({ error: "projectId ist erforderlich" }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.mediaProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
        type: "VIDEO",
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Video-Projekt nicht gefunden" }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status

    const project = await prisma.mediaProject.update({
      where: { id: projectId },
      data: updateData,
    })

    return NextResponse.json({ 
      message: "Video-Projekt aktualisiert",
      project 
    })

  } catch (error) {
    console.error("Error updating video project:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 })
  }
}

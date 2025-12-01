import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"]).optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  prompt: z.string().optional(),
  style: z.string().optional(),
  aspectRatio: z.string().optional(),
  model: z.string().optional(),
  provider: z.string().optional(),
  metadata: z.any().optional(),
})

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.mediaProject.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        captions: {
          orderBy: { createdAt: "desc" },
        },
        postSchedules: {
          include: {
            instagramAccount: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        },
        preset: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Fehler beim Laden des Projekts" }, { status: 500 })
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateProjectSchema.parse(body)

    // Verify project belongs to user
    const existingProject = await prisma.mediaProject.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 })
    }

    const project = await prisma.mediaProject.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        captions: true,
        postSchedules: true,
      },
    })

    return NextResponse.json({ 
      message: "Projekt aktualisiert",
      project 
    })
  } catch (error) {
    console.error("Error updating project:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Aktualisieren des Projekts" }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { id } = await params

    // Verify project belongs to user
    const existingProject = await prisma.mediaProject.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 })
    }

    await prisma.mediaProject.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Projekt gelöscht" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des Projekts" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const projectSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().optional(),
  source: z.enum(["GENERATED", "UPLOADED", "EDITED"]).default("GENERATED"),
})

// GET /api/projects - Get all projects for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (type && (type === "IMAGE" || type === "VIDEO")) {
      where.type = type
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
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.mediaProject.count({ where }),
    ])

    return NextResponse.json({ 
      projects,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Projekte" }, { status: 500 })
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = projectSchema.parse(body)

    const project = await prisma.mediaProject.create({
      data: {
        userId: session.user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        source: data.source,
        status: "DRAFT",
      },
    })

    return NextResponse.json({ 
      message: "Projekt erstellt",
      project 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Erstellen des Projekts" }, { status: 500 })
  }
}

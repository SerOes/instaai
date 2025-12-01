import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const scheduleSchema = z.object({
  projectId: z.string().cuid(),
  accountId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  postType: z.enum(["FEED", "REEL", "STORY", "CAROUSEL"]).default("FEED"),
})

// GET /api/schedules - Get all schedules for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      instagramAccount: {
        userId: session.user.id,
      },
    }

    if (status) {
      whereClause.status = status
    }

    if (startDate || endDate) {
      whereClause.scheduledAt = {}
      if (startDate) {
        whereClause.scheduledAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.scheduledAt.lte = new Date(endDate)
      }
    }

    const schedules = await prisma.postSchedule.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            type: true,
          },
        },
        instagramAccount: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Zeitpläne" }, { status: 500 })
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = scheduleSchema.parse(body)

    // Verify project belongs to user
    const project = await prisma.mediaProject.findFirst({
      where: {
        id: data.projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Projekt nicht gefunden" }, { status: 404 })
    }

    // Verify Instagram account belongs to user
    const account = await prisma.instagramAccount.findFirst({
      where: {
        id: data.accountId,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json({ error: "Instagram-Konto nicht gefunden" }, { status: 404 })
    }

    // Create the schedule
    const schedule = await prisma.postSchedule.create({
      data: {
        projectId: data.projectId,
        instagramAccountId: data.accountId,
        scheduledAt: new Date(data.scheduledAt),
        postType: data.postType,
        status: "PENDING",
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            type: true,
          },
        },
        instagramAccount: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    })

    // Update project status
    await prisma.mediaProject.update({
      where: { id: data.projectId },
      data: { status: "SCHEDULED" },
    })

    return NextResponse.json({ 
      message: "Zeitplan erstellt",
      schedule 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Erstellen des Zeitplans" }, { status: 500 })
  }
}

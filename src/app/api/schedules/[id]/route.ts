import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateScheduleSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  postType: z.enum(["FEED", "REEL", "STORY", "CAROUSEL"]).optional(),
  status: z.enum(["PENDING", "PROCESSING", "POSTED", "FAILED", "CANCELLED"]).optional(),
})

// GET /api/schedules/[id] - Get a single schedule
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

    const schedule = await prisma.postSchedule.findFirst({
      where: {
        id,
        instagramAccount: {
          userId: session.user.id,
        },
      },
      include: {
        project: {
          include: {
            captions: true,
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

    if (!schedule) {
      return NextResponse.json({ error: "Zeitplan nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Fehler beim Laden des Zeitplans" }, { status: 500 })
  }
}

// PATCH /api/schedules/[id] - Update a schedule
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
    const data = updateScheduleSchema.parse(body)

    // Verify schedule belongs to user's account
    const existingSchedule = await prisma.postSchedule.findFirst({
      where: {
        id,
        instagramAccount: {
          userId: session.user.id,
        },
      },
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: "Zeitplan nicht gefunden" }, { status: 404 })
    }

    // Don't allow updating posted schedules
    if (existingSchedule.status === "POSTED") {
      return NextResponse.json({ 
        error: "Bereits veröffentlichte Zeitpläne können nicht bearbeitet werden" 
      }, { status: 400 })
    }

    const schedule = await prisma.postSchedule.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
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

    // Update project status if schedule is cancelled
    if (data.status === "CANCELLED") {
      await prisma.mediaProject.update({
        where: { id: existingSchedule.projectId },
        data: { status: "DRAFT" },
      })
    }

    return NextResponse.json({ 
      message: "Zeitplan aktualisiert",
      schedule 
    })
  } catch (error) {
    console.error("Error updating schedule:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Aktualisieren des Zeitplans" }, { status: 500 })
  }
}

// DELETE /api/schedules/[id] - Delete a schedule
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

    // Verify schedule belongs to user's account
    const existingSchedule = await prisma.postSchedule.findFirst({
      where: {
        id,
        instagramAccount: {
          userId: session.user.id,
        },
      },
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: "Zeitplan nicht gefunden" }, { status: 404 })
    }

    // Don't allow deleting posted schedules
    if (existingSchedule.status === "POSTED") {
      return NextResponse.json({ 
        error: "Bereits veröffentlichte Zeitpläne können nicht gelöscht werden" 
      }, { status: 400 })
    }

    await prisma.postSchedule.delete({
      where: { id },
    })

    // Reset project status to draft
    await prisma.mediaProject.update({
      where: { id: existingSchedule.projectId },
      data: { status: "DRAFT" },
    })

    return NextResponse.json({ message: "Zeitplan gelöscht" })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des Zeitplans" }, { status: 500 })
  }
}

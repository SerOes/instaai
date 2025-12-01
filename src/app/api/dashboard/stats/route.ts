import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const userId = session.user.id

    // Get project counts
    const [
      totalProjects,
      scheduledPosts,
      publishedPosts,
      imageProjects,
      videoProjects,
      recentProjects,
    ] = await Promise.all([
      prisma.mediaProject.count({
        where: { userId },
      }),
      prisma.postSchedule.count({
        where: {
          instagramAccount: { userId },
          status: "PENDING",
        },
      }),
      prisma.postSchedule.count({
        where: {
          instagramAccount: { userId },
          status: "POSTED",
        },
      }),
      prisma.mediaProject.count({
        where: { userId, type: "IMAGE" },
      }),
      prisma.mediaProject.count({
        where: { userId, type: "VIDEO" },
      }),
      prisma.mediaProject.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          thumbnailUrl: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalProjects,
        scheduledPosts,
        publishedPosts,
        totalImages: imageProjects,
        totalVideos: videoProjects,
      },
      recentProjects,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Statistiken" }, { status: 500 })
  }
}

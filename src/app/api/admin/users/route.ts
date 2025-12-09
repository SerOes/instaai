import { NextRequest, NextResponse } from "next/server"
import { auth, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/admin/users
 * Returns all users (Admin only)
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.id)
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        invitedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            mediaProjects: true,
            apiKeys: true,
            instagramAccounts: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Benutzer" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users
 * Update user status (activate/deactivate) - Admin only
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin(session.user.id)
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "userId und isActive sind erforderlich" },
        { status: 400 }
      )
    }

    // Prevent deactivating own account
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Sie können sich nicht selbst deaktivieren" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      }
    })

    return NextResponse.json({
      message: isActive ? "Benutzer aktiviert" : "Benutzer deaktiviert",
      user: updatedUser
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Benutzers" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users
 * Delete a user - Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin(session.user.id)
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId ist erforderlich" },
        { status: 400 }
      )
    }

    // Prevent deleting own account
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Sie können sich nicht selbst löschen" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: "Benutzer erfolgreich gelöscht"
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Fehler beim Löschen des Benutzers" },
      { status: 500 }
    )
  }
}

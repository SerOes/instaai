import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// DELETE /api/instagram/accounts/[id] - Delete an Instagram account
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

    // Find the account and verify ownership
    const account = await prisma.instagramAccount.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account nicht gefunden" }, { status: 404 })
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    // Delete the account (cascade will delete related records)
    await prisma.instagramAccount.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: `@${account.username} wurde getrennt`
    })
  } catch (error) {
    console.error("Error deleting Instagram account:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des Accounts" }, { status: 500 })
  }
}

// GET /api/instagram/accounts/[id] - Get a specific Instagram account
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

    const account = await prisma.instagramAccount.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
        profilePicture: true,
        igBusinessId: true,
        followersCount: true,
        mediaCount: true,
        createdAt: true,
        lastSynced: true,
        _count: {
          select: {
            postSchedules: true,
          },
        },
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account nicht gefunden" }, { status: 404 })
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error fetching Instagram account:", error)
    return NextResponse.json({ error: "Fehler beim Laden des Accounts" }, { status: 500 })
  }
}

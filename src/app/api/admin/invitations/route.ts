import { NextRequest, NextResponse } from "next/server"
import { auth, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendInvitationEmail } from "@/lib/email"

/**
 * GET /api/admin/invitations
 * Returns all invitations (Admin only)
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const isUserAdmin = await isAdmin(session.user.id)
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Einladungen" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/invitations
 * Create a new invitation (Admin only)
 */
export async function POST(request: NextRequest) {
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
    const { email, name } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-Mail ist erforderlich" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already has a user account
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail existiert bereits" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingInvitation && existingInvitation.status === "PENDING") {
      return NextResponse.json(
        { error: "Eine ausstehende Einladung für diese E-Mail existiert bereits" },
        { status: 400 }
      )
    }

    // If there was an old invitation, delete it
    if (existingInvitation) {
      await prisma.invitation.delete({
        where: { id: existingInvitation.id }
      })
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex")
    
    // Invitation expires in 7 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        token,
        invitedById: session.user.id,
        expiresAt,
        status: "PENDING"
      }
    })

    // Generate invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const invitationUrl = `${baseUrl}/auth/accept-invitation?token=${token}`

    // Send invitation email
    let emailSent = false
    let emailError = null
    try {
      // Get inviter's name
      const inviter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      })
      
      await sendInvitationEmail({
        to: normalizedEmail,
        inviteeName: name || undefined,
        inviterName: inviter?.name || inviter?.email || 'Ein Administrator',
        invitationUrl,
        expiresAt,
      })
      emailSent = true
    } catch (error) {
      console.error("Failed to send invitation email:", error)
      emailError = error instanceof Error ? error.message : "E-Mail konnte nicht gesendet werden"
    }

    return NextResponse.json({
      message: emailSent 
        ? "Einladung erfolgreich erstellt und E-Mail gesendet"
        : "Einladung erstellt, aber E-Mail konnte nicht gesendet werden",
      emailSent,
      emailError,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitationUrl,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Einladung" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/invitations
 * Cancel/delete an invitation (Admin only)
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
    const invitationId = searchParams.get("id")

    if (!invitationId) {
      return NextResponse.json(
        { error: "Einladungs-ID ist erforderlich" },
        { status: 400 }
      )
    }

    await prisma.invitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      message: "Einladung erfolgreich gelöscht"
    })
  } catch (error) {
    console.error("Error deleting invitation:", error)
    return NextResponse.json(
      { error: "Fehler beim Löschen der Einladung" },
      { status: 500 }
    )
  }
}

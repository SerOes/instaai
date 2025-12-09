import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { z } from "zod"

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  name: z.string().optional(),
})

/**
 * GET /api/auth/accept-invitation
 * Validate invitation token and return invitation details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token ist erforderlich" },
        { status: 400 }
      )
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Einladung nicht gefunden" },
        { status: 404 }
      )
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Diese Einladung wurde bereits verwendet oder storniert" },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" }
      })
      return NextResponse.json(
        { error: "Diese Einladung ist abgelaufen" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        expiresAt: invitation.expiresAt,
      }
    })
  } catch (error) {
    console.error("Error validating invitation:", error)
    return NextResponse.json(
      { error: "Fehler beim Validieren der Einladung" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/accept-invitation
 * Accept an invitation and create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, name } = acceptInvitationSchema.parse(body)

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Einladung nicht gefunden" },
        { status: 404 }
      )
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Diese Einladung wurde bereits verwendet oder storniert" },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" }
      })
      return NextResponse.json(
        { error: "Diese Einladung ist abgelaufen" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Account mit dieser E-Mail existiert bereits" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and update invitation in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          name: name || invitation.name || null,
          role: "USER",
          isActive: true,
          invitedBy: invitation.invitedById,
          invitedAt: invitation.createdAt,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        }
      })

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date()
        }
      })

      return newUser
    })

    return NextResponse.json({
      message: "Account erfolgreich erstellt",
      user
    }, { status: 201 })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Fehler beim Erstellen des Accounts" },
      { status: 500 }
    )
  }
}

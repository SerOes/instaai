import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { z } from "zod"

const requestResetSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
})

/**
 * POST /api/auth/password-reset
 * Request a password reset link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = requestResetSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Wenn ein Account mit dieser E-Mail existiert, erhalten Sie einen Reset-Link."
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    
    // Token expires in 1 hour
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      }
    })

    // Generate reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    // In production, you would send an email here
    // For now, we'll return the URL in development
    console.log(`Password reset URL for ${email}: ${resetUrl}`)

    return NextResponse.json({
      message: "Wenn ein Account mit dieser E-Mail existiert, erhalten Sie einen Reset-Link.",
      // Only include resetUrl in development
      ...(process.env.NODE_ENV === "development" && { resetUrl })
    })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Fehler beim Anfordern des Password-Resets" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/password-reset
 * Validate reset token
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

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    })

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Ungültiger Reset-Link" },
        { status: 404 }
      )
    }

    if (resetRequest.usedAt) {
      return NextResponse.json(
        { error: "Dieser Reset-Link wurde bereits verwendet" },
        { status: 400 }
      )
    }

    if (new Date() > resetRequest.expiresAt) {
      return NextResponse.json(
        { error: "Dieser Reset-Link ist abgelaufen" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: resetRequest.user.email,
    })
  } catch (error) {
    console.error("Error validating reset token:", error)
    return NextResponse.json(
      { error: "Fehler beim Validieren des Reset-Links" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/auth/password-reset
 * Reset password with token
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token }
    })

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Ungültiger Reset-Link" },
        { status: 404 }
      )
    }

    if (resetRequest.usedAt) {
      return NextResponse.json(
        { error: "Dieser Reset-Link wurde bereits verwendet" },
        { status: 400 }
      )
    }

    if (new Date() > resetRequest.expiresAt) {
      return NextResponse.json(
        { error: "Dieser Reset-Link ist abgelaufen" },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() }
      })
    ])

    return NextResponse.json({
      message: "Passwort erfolgreich geändert"
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Fehler beim Zurücksetzen des Passworts" },
      { status: 500 }
    )
  }
}

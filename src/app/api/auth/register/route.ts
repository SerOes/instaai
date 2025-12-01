import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import prisma from "@/lib/prisma"

const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").optional(),
  locale: z.enum(["de", "en", "tr"]).default("de"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, locale } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Account mit dieser E-Mail-Adresse existiert bereits" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        locale,
      },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { 
        message: "Account erfolgreich erstellt",
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

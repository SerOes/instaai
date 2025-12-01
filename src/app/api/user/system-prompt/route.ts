import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const systemPromptSchema = z.object({
  systemPrompt: z.string().min(10, "System-Prompt muss mindestens 10 Zeichen haben"),
  brandName: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandStyle: z.array(z.string()).optional(),
  contentGoals: z.array(z.string()).optional(),
})

// GET - Aktuellen System-Prompt abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        systemPrompt: true,
        brandName: true,
        industry: true,
        targetAudience: true,
        brandStyle: true,
        contentGoals: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    // Parse JSON strings for SQLite compatibility
    let brandStyle: string[] = []
    let contentGoals: string[] = []
    
    try {
      brandStyle = typeof user.brandStyle === 'string' ? JSON.parse(user.brandStyle) : []
    } catch { brandStyle = [] }
    
    try {
      contentGoals = typeof user.contentGoals === 'string' ? JSON.parse(user.contentGoals) : []
    } catch { contentGoals = [] }

    return NextResponse.json({
      systemPrompt: user.systemPrompt,
      brandName: user.brandName,
      industry: user.industry,
      targetAudience: user.targetAudience,
      brandStyle,
      contentGoals,
    })
  } catch (error) {
    console.error("Error fetching system prompt:", error)
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 })
  }
}

// POST - System-Prompt speichern/aktualisieren
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = systemPromptSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        systemPrompt: data.systemPrompt,
        brandName: data.brandName,
        industry: data.industry,
        targetAudience: data.targetAudience,
        brandStyle: JSON.stringify(data.brandStyle || []),
        contentGoals: JSON.stringify(data.contentGoals || []),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "System-Prompt erfolgreich gespeichert",
      systemPrompt: user.systemPrompt,
    })
  } catch (error) {
    console.error("Error saving system prompt:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 })
  }
}

// DELETE - System-Prompt löschen
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        systemPrompt: null,
        brandName: null,
        industry: null,
        targetAudience: null,
        brandStyle: "[]",
        contentGoals: "[]",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: "System-Prompt gelöscht" })
  } catch (error) {
    console.error("Error deleting system prompt:", error)
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 })
  }
}

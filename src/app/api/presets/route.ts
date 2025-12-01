import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const presetSchema = z.object({
  name: z.string().min(1, "Name erforderlich"),
  type: z.enum(["IMAGE", "VIDEO"]),
  category: z.string().optional(),
  promptTemplate: z.string().min(10, "Prompt-Template erforderlich"),
  style: z.string().optional(),
  aspectRatio: z.string().optional(),
  duration: z.number().optional(),
  isPublic: z.boolean().default(false),
})

// GET /api/presets - Get all presets
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "IMAGE" | "VIDEO" | null
    const includePublic = searchParams.get("includePublic") === "true"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      OR: [
        { userId: session.user.id },
      ],
    }

    if (includePublic) {
      whereClause.OR.push({ isPublic: true })
    }

    if (type) {
      whereClause.type = type
    }

    const presets = await prisma.aiPreset.findMany({
      where: whereClause,
      orderBy: [
        { isPublic: "desc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json({ presets })
  } catch (error) {
    console.error("Error fetching presets:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Presets" }, { status: 500 })
  }
}

// POST /api/presets - Create a new preset
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = presetSchema.parse(body)

    const preset = await prisma.aiPreset.create({
      data: {
        ...data,
        category: data.category || "custom",
        userId: session.user.id,
      },
    })

    return NextResponse.json({ 
      message: "Preset erstellt",
      preset 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating preset:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Erstellen des Presets" }, { status: 500 })
  }
}

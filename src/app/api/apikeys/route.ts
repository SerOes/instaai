import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { encryptApiKey, decryptApiKey } from "@/lib/utils"

const apiKeySchema = z.object({
  provider: z.enum(["GEMINI", "KIE"]),
  key: z.string().min(10, "API Key zu kurz"),
  name: z.string().optional(),
})

// GET /api/apikeys - Get all API keys for the user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        label: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Fehler beim Laden der API Keys" }, { status: 500 })
  }
}

// POST /api/apikeys - Create or update an API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { provider, key, name } = apiKeySchema.parse(body)

    // Encrypt the API key
    const keyEncrypted = encryptApiKey(key)

    // Check if an API key for this provider already exists
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    let apiKey

    if (existingKey) {
      // Update existing key
      apiKey = await prisma.apiKey.update({
        where: { id: existingKey.id },
        data: {
          keyEncrypted,
          label: name,
          isActive: true,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          provider: true,
          label: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } else {
      // Create new key
      apiKey = await prisma.apiKey.create({
        data: {
          userId: session.user.id,
          provider,
          keyEncrypted,
          label: name,
        },
        select: {
          id: true,
          provider: true,
          label: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    }

    return NextResponse.json({ 
      message: "API Key gespeichert",
      apiKey 
    }, { status: existingKey ? 200 : 201 })
  } catch (error) {
    console.error("Error saving API key:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Speichern des API Keys" }, { status: 500 })
  }
}

// DELETE /api/apikeys/:id
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID erforderlich" }, { status: 400 })
    }

    // Verify the API key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API Key nicht gefunden" }, { status: 404 })
    }

    await prisma.apiKey.delete({
      where: { id },
    })

    return NextResponse.json({ message: "API Key gelöscht" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des API Keys" }, { status: 500 })
  }
}

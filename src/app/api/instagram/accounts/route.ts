import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const accountSchema = z.object({
  username: z.string().min(1, "Benutzername erforderlich"),
  accessToken: z.string().min(1, "Access Token erforderlich"),
  igBusinessId: z.string().min(1, "Instagram Business ID erforderlich"),
  profilePicture: z.string().url().optional(),
})

// GET /api/instagram/accounts - Get all Instagram accounts
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const accounts = await prisma.instagramAccount.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        igBusinessId: true,
        createdAt: true,
        _count: {
          select: {
            postSchedules: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Instagram-Konten" }, { status: 500 })
  }
}

// POST /api/instagram/accounts - Add a new Instagram account
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = accountSchema.parse(body)

    // Check if account already exists for this user
    const existingAccount = await prisma.instagramAccount.findFirst({
      where: {
        userId: session.user.id,
        username: data.username,
      },
    })

    if (existingAccount) {
      return NextResponse.json({ 
        error: "Dieses Instagram-Konto ist bereits verbunden" 
      }, { status: 400 })
    }

    // Verify the access token with Instagram API
    // This is a simplified version - in production, you'd want to:
    // 1. Use OAuth flow to get the token
    // 2. Validate the token with Instagram Graph API
    // 3. Get the user's profile info

    // Encrypt the access token
    const { encryptApiKey } = await import("@/lib/utils")
    const encryptedToken = encryptApiKey(data.accessToken)

    const account = await prisma.instagramAccount.create({
      data: {
        userId: session.user.id,
        username: data.username,
        accessTokenEncrypted: encryptedToken,
        igBusinessId: data.igBusinessId,
        profilePicture: data.profilePicture,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        igBusinessId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ 
      message: "Instagram-Konto verbunden",
      account 
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding Instagram account:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Hinzufügen des Instagram-Kontos" }, { status: 500 })
  }
}

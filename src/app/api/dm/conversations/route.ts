import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Get all DM conversations for the user's Instagram accounts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instagramAccountId = searchParams.get("accountId")
    const isActive = searchParams.get("isActive")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get user's Instagram accounts
    const instagramAccounts = await prisma.instagramAccount.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (instagramAccounts.length === 0) {
      return NextResponse.json({ conversations: [], total: 0 })
    }

    const accountIds = instagramAccountId 
      ? [instagramAccountId]
      : instagramAccounts.map(a => a.id)

    // Build where clause
    const whereClause: Record<string, unknown> = {
      instagramAccountId: { in: accountIds },
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === "true"
    }

    // Get conversations with latest message
    const [conversations, total] = await Promise.all([
      prisma.dMConversation.findMany({
        where: whereClause,
        include: {
          instagramAccount: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.dMConversation.count({ where: whereClause }),
    ])

    return NextResponse.json({
      conversations: conversations.map((conv: {
        id: string
        igConversationId: string
        participantIgId: string
        participantUsername: string | null
        participantName: string | null
        participantPicture: string | null
        instagramAccount: { id: string; username: string; profilePicture: string | null }
        isActive: boolean
        isAutomated: boolean
        lastMessageAt: Date | null
        unreadCount: number
        messages: Array<{ id: string; content: string; direction: string; sentAt: Date; aiStatus: string | null }>
        createdAt: Date
      }) => ({
        id: conv.id,
        igConversationId: conv.igConversationId,
        participant: {
          igId: conv.participantIgId,
          username: conv.participantUsername,
          name: conv.participantName,
          picture: conv.participantPicture,
        },
        instagramAccount: conv.instagramAccount,
        isActive: conv.isActive,
        isAutomated: conv.isAutomated,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        lastMessage: conv.messages[0] || null,
        createdAt: conv.createdAt,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Konversationen" }, { status: 500 })
  }
}

const conversationSchema = z.object({
  instagramAccountId: z.string().cuid(),
  igConversationId: z.string().min(1),
  participantIgId: z.string().min(1),
  participantUsername: z.string().optional(),
  participantName: z.string().optional(),
  participantPicture: z.string().url().optional(),
  isAutomated: z.boolean().default(false),
})

// Create a new conversation (usually called when receiving a new message)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = conversationSchema.parse(body)

    // Verify the Instagram account belongs to the user
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        id: data.instagramAccountId,
        userId: session.user.id,
      },
    })

    if (!instagramAccount) {
      return NextResponse.json({ error: "Instagram Account nicht gefunden" }, { status: 404 })
    }

    // Check if conversation already exists
    const existingConversation = await prisma.dMConversation.findUnique({
      where: { igConversationId: data.igConversationId },
    })

    if (existingConversation) {
      return NextResponse.json({ 
        conversation: existingConversation,
        created: false,
      })
    }

    // Create new conversation
    const conversation = await prisma.dMConversation.create({
      data: {
        instagramAccountId: data.instagramAccountId,
        igConversationId: data.igConversationId,
        participantIgId: data.participantIgId,
        participantUsername: data.participantUsername,
        participantName: data.participantName,
        participantPicture: data.participantPicture,
        isAutomated: data.isAutomated,
      },
    })

    return NextResponse.json({ 
      conversation,
      created: true,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Erstellen der Konversation" }, { status: 500 })
  }
}

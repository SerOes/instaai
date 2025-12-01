import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const direction = searchParams.get("direction") // "INBOUND" | "OUTBOUND"
    const aiStatus = searchParams.get("aiStatus")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId erforderlich" }, { status: 400 })
    }

    // Verify the conversation belongs to user's Instagram account
    const conversation = await prisma.dMConversation.findFirst({
      where: {
        id: conversationId,
        instagramAccount: {
          userId: session.user.id,
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Konversation nicht gefunden" }, { status: 404 })
    }

    // Build where clause
    const whereClause: Record<string, unknown> = {
      conversationId,
    }

    if (direction) {
      whereClause.direction = direction
    }

    if (aiStatus) {
      whereClause.aiStatus = aiStatus
    }

    // Get messages
    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
        where: whereClause,
        orderBy: { sentAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.directMessage.count({ where: whereClause }),
    ])

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Nachrichten" }, { status: 500 })
  }
}

const messageSchema = z.object({
  conversationId: z.string().cuid(),
  igMessageId: z.string().optional(),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  messageType: z.enum(["TEXT", "IMAGE", "VIDEO", "STORY_REPLY", "REEL_SHARE"]).default("TEXT"),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  status: z.enum(["RECEIVED", "READ", "REPLIED", "PENDING_REPLY"]).default("RECEIVED"),
  aiStatus: z.enum(["PENDING", "GENERATED", "APPROVED", "SENT", "SKIPPED"]).optional(),
  aiResponse: z.string().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  aiModel: z.string().optional(),
})

// Create a new message in a conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = messageSchema.parse(body)

    // Verify the conversation belongs to user's Instagram account
    const conversation = await prisma.dMConversation.findFirst({
      where: {
        id: data.conversationId,
        instagramAccount: {
          userId: session.user.id,
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Konversation nicht gefunden" }, { status: 404 })
    }

    // Create the message
    const message = await prisma.directMessage.create({
      data: {
        conversationId: data.conversationId,
        igMessageId: data.igMessageId,
        direction: data.direction,
        messageType: data.messageType,
        content: data.content,
        mediaUrl: data.mediaUrl,
        status: data.status,
        aiStatus: data.aiStatus,
        aiResponse: data.aiResponse,
        aiConfidence: data.aiConfidence,
        aiModel: data.aiModel,
      },
    })

    // Update conversation's last message timestamp and unread count
    const updateData: Record<string, unknown> = {
      lastMessageAt: new Date(),
    }

    if (data.direction === "INBOUND") {
      updateData.unreadCount = { increment: 1 }
    }

    await prisma.dMConversation.update({
      where: { id: data.conversationId },
      data: updateData,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Erstellen der Nachricht" }, { status: 500 })
  }
}

const updateMessageSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["RECEIVED", "READ", "REPLIED", "PENDING_REPLY"]).optional(),
  aiStatus: z.enum(["PENDING", "GENERATED", "APPROVED", "SENT", "SKIPPED"]).optional(),
  aiResponse: z.string().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  readAt: z.string().datetime().optional(),
  repliedAt: z.string().datetime().optional(),
})

// Update a message (e.g., mark as read, update AI status)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateMessageSchema.parse(body)

    // Verify the message belongs to user's conversation
    const existingMessage = await prisma.directMessage.findFirst({
      where: {
        id: data.id,
        conversation: {
          instagramAccount: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: "Nachricht nicht gefunden" }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    
    if (data.status !== undefined) updateData.status = data.status
    if (data.aiStatus !== undefined) updateData.aiStatus = data.aiStatus
    if (data.aiResponse !== undefined) updateData.aiResponse = data.aiResponse
    if (data.aiConfidence !== undefined) updateData.aiConfidence = data.aiConfidence
    if (data.readAt !== undefined) updateData.readAt = new Date(data.readAt)
    if (data.repliedAt !== undefined) updateData.repliedAt = new Date(data.repliedAt)

    const message = await prisma.directMessage.update({
      where: { id: data.id },
      data: updateData,
    })

    // If marking as read, update conversation unread count
    if (data.status === "READ" && existingMessage.status !== "READ") {
      await prisma.dMConversation.update({
        where: { id: existingMessage.conversationId },
        data: {
          unreadCount: { decrement: 1 },
        },
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error updating message:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Aktualisieren der Nachricht" }, { status: 500 })
  }
}

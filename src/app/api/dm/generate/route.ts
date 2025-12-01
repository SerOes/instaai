import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { DMAIProviderService } from "@/lib/dm-ai-provider"
import { decryptApiKey } from "@/lib/utils"

const generateResponseSchema = z.object({
  conversationId: z.string().cuid(),
  messageId: z.string().cuid().optional(),
  message: z.string().min(1, "Nachricht erforderlich"),
  model: z.enum(["gemini-2.5-flash", "gemini-3.0-pro"]).default("gemini-2.5-flash"),
  generateSuggestions: z.boolean().default(false),
})

// Generate AI response for a DM
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = generateResponseSchema.parse(body)

    // Verify the conversation belongs to user's Instagram account
    const conversation = await prisma.dMConversation.findFirst({
      where: {
        id: data.conversationId,
        instagramAccount: {
          userId: session.user.id,
        },
      },
      include: {
        instagramAccount: {
          include: {
            dmAutomation: true,
          },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 10, // Get last 10 messages for context
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Konversation nicht gefunden" }, { status: 404 })
    }

    // Get user's Gemini API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "GEMINI",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Kein aktiver Gemini API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu." 
      }, { status: 400 })
    }

    // Get user's brand context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true, brandName: true },
    })

    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    // Get automation settings
    const automation = conversation.instagramAccount.dmAutomation

    // Initialize DM AI Provider
    const dmAI = new DMAIProviderService({
      geminiApiKey: geminiKey,
      defaultLanguage: (automation?.defaultLanguage as "de" | "en" | "tr") || "de",
      defaultTone: (automation?.tone as "friendly" | "professional" | "casual") || "friendly",
      systemPrompt: automation?.systemPrompt || user?.systemPrompt || undefined,
      brandName: user?.brandName || undefined,
    })

    // Build conversation history for context
    const conversationHistory = conversation.messages
      .reverse()
      .slice(0, automation?.contextWindow || 5)
      .map((msg: { direction: string; content: string; sentAt: Date }) => ({
        role: msg.direction === "INBOUND" ? "user" as const : "assistant" as const,
        content: msg.content,
        timestamp: msg.sentAt,
      }))

    // Parse category responses and keywords if available
    let categoryResponses: Record<string, string> | undefined
    let keywords: Record<string, string> | undefined
    
    try {
      categoryResponses = automation?.categoryResponses 
        ? JSON.parse(automation.categoryResponses)
        : undefined
    } catch {
      categoryResponses = undefined
    }
    
    try {
      keywords = automation?.keywords
        ? JSON.parse(automation.keywords)
        : undefined
    } catch {
      keywords = undefined
    }

    // Generate response
    const result = await dmAI.generateResponse({
      incomingMessage: data.message,
      conversationHistory,
      senderUsername: conversation.participantUsername || undefined,
      senderName: conversation.participantName || undefined,
      categoryResponses,
      keywords,
      maxLength: automation?.maxResponseLength || 500,
      model: data.model,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Generate suggestions if requested
    let suggestions: string[] = []
    if (data.generateSuggestions) {
      const suggestionsResult = await dmAI.generateResponseSuggestions(data.message, {
        brandName: user?.brandName || undefined,
        systemPrompt: automation?.systemPrompt || user?.systemPrompt || undefined,
      })
      suggestions = suggestionsResult.suggestions
    }

    // If messageId is provided, update the message with AI response
    if (data.messageId) {
      await prisma.directMessage.update({
        where: { id: data.messageId },
        data: {
          aiStatus: "GENERATED",
          aiResponse: result.response,
          aiConfidence: result.confidence,
          aiModel: data.model,
        },
      })
    }

    // Update automation stats
    if (automation) {
      await prisma.dMAutomation.update({
        where: { id: automation.id },
        data: {
          totalProcessed: { increment: 1 },
        },
      })
    }

    return NextResponse.json({
      response: result.response,
      confidence: result.confidence,
      detectedCategory: result.detectedCategory,
      suggestions,
      model: data.model,
    })
  } catch (error) {
    console.error("Error generating DM response:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Antwort-Generierung" }, { status: 500 })
  }
}

const analyzeMessageSchema = z.object({
  message: z.string().min(1, "Nachricht erforderlich"),
  conversationId: z.string().cuid().optional(),
})

// Analyze a message (intent, sentiment, category)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = analyzeMessageSchema.parse(body)

    // Get user's Gemini API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "GEMINI",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Kein aktiver Gemini API-Schlüssel gefunden." 
      }, { status: 400 })
    }

    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    // Initialize DM AI Provider
    const dmAI = new DMAIProviderService({
      geminiApiKey: geminiKey,
    })

    // Analyze the message
    const analysis = await dmAI.analyzeMessage({
      message: data.message,
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing message:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Analyse" }, { status: 500 })
  }
}

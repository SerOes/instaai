import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Get DM automation settings for an Instagram account
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instagramAccountId = searchParams.get("accountId")

    if (!instagramAccountId) {
      return NextResponse.json({ error: "accountId erforderlich" }, { status: 400 })
    }

    // Verify the Instagram account belongs to the user
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        id: instagramAccountId,
        userId: session.user.id,
      },
    })

    if (!instagramAccount) {
      return NextResponse.json({ error: "Instagram Account nicht gefunden" }, { status: 404 })
    }

    // Get automation settings
    const automation = await prisma.dMAutomation.findUnique({
      where: { instagramAccountId },
    })

    // Return default settings if none exist
    if (!automation) {
      return NextResponse.json({
        automation: {
          instagramAccountId,
          isEnabled: false,
          autoReplyEnabled: false,
          defaultLanguage: "de",
          tone: "friendly",
          responseDelay: 0,
          systemPrompt: null,
          contextWindow: 5,
          maxResponseLength: 500,
          categoryResponses: {},
          quickReplies: [],
          keywords: {},
          blacklistedPhrases: [],
          operatingHours: { enabled: false },
          outOfOfficeMessage: null,
          totalProcessed: 0,
          totalAutoReplied: 0,
        },
        exists: false,
      })
    }

    // Parse JSON fields
    return NextResponse.json({
      automation: {
        ...automation,
        categoryResponses: JSON.parse(automation.categoryResponses || "{}"),
        quickReplies: JSON.parse(automation.quickReplies || "[]"),
        keywords: JSON.parse(automation.keywords || "{}"),
        blacklistedPhrases: JSON.parse(automation.blacklistedPhrases || "[]"),
        operatingHours: JSON.parse(automation.operatingHours || "{}"),
      },
      exists: true,
    })
  } catch (error) {
    console.error("Error fetching automation settings:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Einstellungen" }, { status: 500 })
  }
}

const automationSchema = z.object({
  instagramAccountId: z.string().cuid(),
  isEnabled: z.boolean().default(false),
  autoReplyEnabled: z.boolean().default(false),
  defaultLanguage: z.enum(["de", "en", "tr"]).default("de"),
  tone: z.enum(["friendly", "professional", "casual"]).default("friendly"),
  responseDelay: z.number().min(0).max(3600).default(0),
  systemPrompt: z.string().max(2000).optional().nullable(),
  contextWindow: z.number().min(1).max(20).default(5),
  maxResponseLength: z.number().min(50).max(2000).default(500),
  categoryResponses: z.record(z.string(), z.string()).optional(),
  quickReplies: z.array(z.object({
    id: z.string(),
    label: z.string(),
    text: z.string(),
  })).optional(),
  keywords: z.record(z.string(), z.string()).optional(),
  blacklistedPhrases: z.array(z.string()).optional(),
  operatingHours: z.object({
    enabled: z.boolean(),
    hours: z.record(z.string(), z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  }).optional(),
  outOfOfficeMessage: z.string().max(500).optional().nullable(),
})

// Create or update DM automation settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = automationSchema.parse(body)

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

    // Convert complex objects to JSON strings for SQLite
    const automationData = {
      isEnabled: data.isEnabled,
      autoReplyEnabled: data.autoReplyEnabled,
      defaultLanguage: data.defaultLanguage,
      tone: data.tone,
      responseDelay: data.responseDelay,
      systemPrompt: data.systemPrompt,
      contextWindow: data.contextWindow,
      maxResponseLength: data.maxResponseLength,
      categoryResponses: JSON.stringify(data.categoryResponses || {}),
      quickReplies: JSON.stringify(data.quickReplies || []),
      keywords: JSON.stringify(data.keywords || {}),
      blacklistedPhrases: JSON.stringify(data.blacklistedPhrases || []),
      operatingHours: JSON.stringify(data.operatingHours || {}),
      outOfOfficeMessage: data.outOfOfficeMessage,
    }

    // Upsert automation settings
    const automation = await prisma.dMAutomation.upsert({
      where: { instagramAccountId: data.instagramAccountId },
      create: {
        instagramAccountId: data.instagramAccountId,
        ...automationData,
      },
      update: automationData,
    })

    return NextResponse.json({
      automation: {
        ...automation,
        categoryResponses: JSON.parse(automation.categoryResponses || "{}"),
        quickReplies: JSON.parse(automation.quickReplies || "[]"),
        keywords: JSON.parse(automation.keywords || "{}"),
        blacklistedPhrases: JSON.parse(automation.blacklistedPhrases || "[]"),
        operatingHours: JSON.parse(automation.operatingHours || "{}"),
      },
    })
  } catch (error) {
    console.error("Error saving automation settings:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Speichern der Einstellungen" }, { status: 500 })
  }
}

// Toggle automation on/off (quick toggle)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { instagramAccountId, isEnabled, autoReplyEnabled } = z.object({
      instagramAccountId: z.string().cuid(),
      isEnabled: z.boolean().optional(),
      autoReplyEnabled: z.boolean().optional(),
    }).parse(body)

    // Verify the Instagram account belongs to the user
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        id: instagramAccountId,
        userId: session.user.id,
      },
    })

    if (!instagramAccount) {
      return NextResponse.json({ error: "Instagram Account nicht gefunden" }, { status: 404 })
    }

    const updateData: Record<string, boolean> = {}
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (autoReplyEnabled !== undefined) updateData.autoReplyEnabled = autoReplyEnabled

    // Check if automation exists, if not create with defaults
    const existingAutomation = await prisma.dMAutomation.findUnique({
      where: { instagramAccountId },
    })

    let automation
    if (existingAutomation) {
      automation = await prisma.dMAutomation.update({
        where: { instagramAccountId },
        data: updateData,
      })
    } else {
      automation = await prisma.dMAutomation.create({
        data: {
          instagramAccountId,
          ...updateData,
        },
      })
    }

    return NextResponse.json({
      automation: {
        id: automation.id,
        isEnabled: automation.isEnabled,
        autoReplyEnabled: automation.autoReplyEnabled,
      },
    })
  } catch (error) {
    console.error("Error toggling automation:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const insightsSchema = z.object({
  timeframe: z.enum(["7d", "30d", "90d"]).default("30d"),
  model: z.enum(["gemini-2.5-flash", "gemini-3.0-pro"]).default("gemini-3.0-pro"),
})

interface ContentStats {
  totalProjects: number
  imageProjects: number
  videoProjects: number
  completedProjects: number
  scheduledPosts: number
  postedPosts: number
  failedPosts: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = insightsSchema.parse({
      timeframe: searchParams.get("timeframe") || "30d",
      model: searchParams.get("model") || "gemini-3.0-pro",
    })

    // Calculate date range
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 }
    const days = daysMap[params.timeframe]
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch user data and stats in parallel
    const [user, apiKey, contentStats, recentProjects, scheduleStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          systemPrompt: true,
          brandName: true,
          industry: true,
          targetAudience: true,
          brandStyle: true,
          contentGoals: true,
        },
      }),
      prisma.apiKey.findFirst({
        where: {
          userId: session.user.id,
          provider: "GEMINI",
          isActive: true,
        },
      }),
      // Content creation stats
      prisma.mediaProject.groupBy({
        by: ["type", "status"],
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
      // Recent projects for context
      prisma.mediaProject.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          type: true,
          title: true,
          status: true,
          style: true,
          createdAt: true,
        },
      }),
      // Schedule stats
      prisma.postSchedule.groupBy({
        by: ["status"],
        where: {
          instagramAccount: {
            userId: session.user.id,
          },
          createdAt: { gte: startDate },
        },
        _count: true,
      }),
    ])

    if (!apiKey) {
      return NextResponse.json(
        { error: "Kein aktiver Gemini API-Schlüssel gefunden" },
        { status: 400 }
      )
    }

    // Aggregate stats
    const stats: ContentStats = {
      totalProjects: 0,
      imageProjects: 0,
      videoProjects: 0,
      completedProjects: 0,
      scheduledPosts: 0,
      postedPosts: 0,
      failedPosts: 0,
    }

    contentStats.forEach((item) => {
      stats.totalProjects += item._count
      if (item.type === "IMAGE") stats.imageProjects += item._count
      if (item.type === "VIDEO") stats.videoProjects += item._count
      if (item.status === "COMPLETED") stats.completedProjects += item._count
    })

    scheduleStats.forEach((item) => {
      if (item.status === "PENDING") stats.scheduledPosts += item._count
      if (item.status === "POSTED") stats.postedPosts += item._count
      if (item.status === "FAILED") stats.failedPosts += item._count
    })

    // Build context for AI analysis
    const brandContext = user?.systemPrompt
      ? `Brand Context:\n${user.systemPrompt}`
      : `Brand: ${user?.brandName || "Nicht definiert"}
Industry: ${user?.industry || "Nicht definiert"}
Target Audience: ${user?.targetAudience || "Nicht definiert"}
Style: ${user?.brandStyle || "Nicht definiert"}
Goals: ${user?.contentGoals || "Nicht definiert"}`

    const statsContext = `
Content Statistics (last ${days} days):
- Total Projects Created: ${stats.totalProjects}
- Image Projects: ${stats.imageProjects}
- Video Projects: ${stats.videoProjects}
- Completed Projects: ${stats.completedProjects}
- Posts Scheduled: ${stats.scheduledPosts}
- Posts Published: ${stats.postedPosts}
- Failed Posts: ${stats.failedPosts}

Recent Content Types: ${recentProjects.map((p) => p.type).join(", ") || "None"}
Recent Styles Used: ${[...new Set(recentProjects.map((p) => p.style).filter(Boolean))].join(", ") || "None"}`

    const prompt = `Du bist ein Instagram Growth-Experte und Content-Stratege. Analysiere die folgenden Daten und gib personalisierte Wachstums-Empfehlungen.

${brandContext}

${statsContext}

Erstelle eine detaillierte Analyse mit folgenden Abschnitten (im JSON-Format):

{
  "summary": "Kurze Zusammenfassung der aktuellen Performance (2-3 Sätze)",
  "strengths": ["3-5 Stärken basierend auf den Daten"],
  "improvements": ["3-5 konkrete Verbesserungsvorschläge"],
  "contentStrategy": {
    "recommendedFormats": ["Empfohlene Content-Formate mit Begründung"],
    "postingFrequency": "Empfohlene Posting-Frequenz",
    "bestPractices": ["3-5 Best Practices für die Marke"]
  },
  "nextSteps": ["5 konkrete nächste Schritte priorisiert"],
  "growthPotential": "Einschätzung des Wachstumspotenzials (hoch/mittel/niedrig) mit Begründung"
}

Antworte NUR mit dem JSON-Objekt, keine zusätzlichen Erklärungen.`

    // Call Gemini API
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      console.error("Gemini API Error:", await geminiResponse.text())
      return NextResponse.json(
        { error: "Fehler bei der KI-Analyse" },
        { status: 500 }
      )
    }

    const geminiData = await geminiResponse.json()
    const rawResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}"

    // Parse JSON response
    let insights
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch {
      console.error("Failed to parse insights:", rawResponse)
      insights = {
        summary: "Analyse konnte nicht durchgeführt werden.",
        strengths: [],
        improvements: ["Bitte versuchen Sie es erneut."],
        contentStrategy: {
          recommendedFormats: [],
          postingFrequency: "Nicht verfügbar",
          bestPractices: [],
        },
        nextSteps: ["Erstellen Sie mehr Content für eine bessere Analyse."],
        growthPotential: "Nicht bestimmbar",
      }
    }

    return NextResponse.json({
      insights,
      stats,
      timeframe: params.timeframe,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating growth insights:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Fehler bei der Insights-Generierung" },
      { status: 500 }
    )
  }
}

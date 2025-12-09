import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Schema for seasonal ideas request
const seasonalIdeasSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().optional(),
  count: z.number().min(1).max(10).default(6),
  contentTypes: z.array(z.enum(["image", "video", "carousel"])).optional(),
  locale: z.enum(["de", "en", "tr", "at"]).default("de"),
})

// Seasonal events database
const SEASONAL_EVENTS: Record<number, { global: string[], at: string[], de: string[] }> = {
  1: {
    global: ["Neujahr", "Winter", "Neuanfang", "Vorsätze"],
    at: ["Dreikönigstag", "Winterschlussverkauf", "Skiurlaub"],
    de: ["Winterschlussverkauf", "Karneval Vorbereitung"],
  },
  2: {
    global: ["Valentinstag", "Winter", "Liebe"],
    at: ["Fasching", "Opernball"],
    de: ["Karneval", "Fasching", "Valentinstag"],
  },
  3: {
    global: ["Frühlingsanfang", "Frühjahrsputz", "Ostern"],
    at: ["Frühlingserwachen", "Ostermarkt"],
    de: ["Frühlingsanfang", "Ostern"],
  },
  4: {
    global: ["Ostern", "Frühling", "Frühlingsblumen"],
    at: ["Ostermärkte", "Frühlingserwachen"],
    de: ["Ostern", "Frühlingsanfang"],
  },
  5: {
    global: ["Muttertag", "Frühling", "Outdoor"],
    at: ["Maibaum", "Staatsfeiertag"],
    de: ["Muttertag", "Vatertag", "Pfingsten"],
  },
  6: {
    global: ["Sommeranfang", "Vatertag", "Outdoor"],
    at: ["Fronleichnam", "Sommerbeginn"],
    de: ["Sommeranfang", "Ferienbeginn"],
  },
  7: {
    global: ["Sommer", "Urlaub", "Ferien", "Outdoor"],
    at: ["Sommerferien", "Badewetter", "Festivals"],
    de: ["Sommerferien", "Urlaub"],
  },
  8: {
    global: ["Sommer", "Back to School", "Spätsommer"],
    at: ["Maria Himmelfahrt", "Schulanfang Vorbereitung"],
    de: ["Schulanfang Vorbereitung", "Spätsommer"],
  },
  9: {
    global: ["Schulanfang", "Herbstanfang", "Back to School"],
    at: ["Schulstart", "Wiener Wiesn", "Erntedank"],
    de: ["Schulanfang", "Oktoberfest Vorbereitung"],
  },
  10: {
    global: ["Halloween", "Herbst", "Erntedank"],
    at: ["Nationalfeiertag", "Halloween", "Herbstmarkt"],
    de: ["Oktoberfest", "Halloween", "Erntedank"],
  },
  11: {
    global: ["Black Friday", "Herbst", "Vorweihnachtszeit"],
    at: ["Allerheiligen", "Martinstag", "Black Friday"],
    de: ["Martinstag", "Black Friday", "Totensonntag"],
  },
  12: {
    global: ["Weihnachten", "Advent", "Silvester", "Winter", "Geschenke"],
    at: ["Krampus", "Nikolaus", "Adventmärkte Wien", "Christkindlmarkt", "Heiliger Abend", "Silvester"],
    de: ["Nikolaus", "Advent", "Weihnachtsmärkte", "Heiligabend", "Silvester"],
  },
}

// Generate seasonal ideas using Gemini
async function generateSeasonalIdeas(
  geminiKey: string,
  systemPrompt: string,
  brandInfo: {
    brandName?: string
    industry?: string
    targetAudience?: string
    brandStyle?: string[]
    contentGoals?: string[]
  },
  month: number,
  year: number,
  locale: string,
  count: number
) {
  const monthNames = {
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  }
  
  const monthName = monthNames.de[month - 1]
  const seasonalEvents = SEASONAL_EVENTS[month]
  const localEvents = locale === "at" ? seasonalEvents.at : locale === "de" ? seasonalEvents.de : seasonalEvents.global
  const allEvents = [...seasonalEvents.global, ...localEvents]

  const prompt = `Du bist ein erfahrener Social-Media-Stratege und Content-Creator.

MARKEN-KONTEXT:
${systemPrompt}

ZUSÄTZLICHE MARKEN-INFOS:
- Markenname: ${brandInfo.brandName || "Nicht angegeben"}
- Branche: ${brandInfo.industry || "Nicht angegeben"}
- Zielgruppe: ${brandInfo.targetAudience || "Nicht angegeben"}
- Markenstil: ${brandInfo.brandStyle?.join(", ") || "Nicht angegeben"}
- Content-Ziele: ${brandInfo.contentGoals?.join(", ") || "Nicht angegeben"}

ZEITLICHER KONTEXT:
- Aktueller Monat: ${monthName} ${year}
- Region: ${locale === "at" ? "Österreich" : locale === "de" ? "Deutschland" : "DACH-Region"}
- Saisonale Events/Themen: ${allEvents.join(", ")}

AUFGABE:
Generiere genau ${count} kreative, saisonale Content-Ideen für Instagram, die perfekt zu der Marke und deren Produkten/Dienstleistungen passen.

Für JEDE Idee liefere:
1. Einen aussagekräftigen Titel
2. Eine detaillierte Beschreibung (2-3 Sätze)
3. Den empfohlenen Content-Typ (image, video, oder carousel)
4. Einen optimierten Bild-Prompt (auf Englisch, für AI-Bildgenerierung optimiert, sehr detailliert mit Stil, Beleuchtung, Komposition)
5. Einen optimierten Video-Prompt (auf Englisch, für AI-Videogenerierung optimiert, mit Bewegung und Dynamik)
6. Einen Caption-Vorschlag (auf Deutsch, emotional, mit Call-to-Action)
7. 10-15 relevante Hashtags
8. Saisonale Tags (z.B. ["weihnachten", "advent"])
9. Ein vorgeschlagenes Veröffentlichungsdatum im Format YYYY-MM-DD

WICHTIG:
- Die Bild- und Video-Prompts müssen auf Englisch sein und sehr detailliert
- Die Caption muss zur Markensprache passen
- Das vorgeschlagene Datum sollte zu saisonalen Events passen (z.B. 6.12. für Nikolaus)
- Berücksichtige die Produkte/Dienstleistungen der Marke

Antworte NUR im folgenden JSON-Format, ohne Markdown-Code-Blöcke:
{
  "ideas": [
    {
      "title": "Titel der Idee",
      "description": "Beschreibung der Idee",
      "contentType": "image|video|carousel",
      "imagePrompt": "Detailed English prompt for AI image generation...",
      "videoPrompt": "Detailed English prompt for AI video generation with motion...",
      "captionSuggestion": "Deutsche Caption mit Emojis und Call-to-Action",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "seasonalTags": ["weihnachten", "advent"],
      "suggestedDate": "2025-12-06"
    }
  ]
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Gemini API request failed")
  }

  const data = await response.json()
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

  // Clean up JSON response (remove markdown if present)
  let cleanedResponse = textResponse
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  try {
    const parsed = JSON.parse(cleanedResponse)
    return parsed.ideas
  } catch (parseError) {
    console.error("Failed to parse Gemini response:", cleanedResponse)
    throw new Error("Failed to parse AI response")
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = seasonalIdeasSchema.parse(body)

    // Get current date if not provided
    const now = new Date()
    const month = data.month || now.getMonth() + 1
    const year = data.year || now.getFullYear()

    // Get user with system prompt and brand info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        systemPrompt: true,
        brandName: true,
        industry: true,
        targetAudience: true,
        brandStyle: true,
        contentGoals: true,
        locale: true,
      },
    })

    if (!user?.systemPrompt) {
      return NextResponse.json({
        error: "Bitte erstelle zuerst einen System-Prompt in den Einstellungen, um personalisierte saisonale Ideen zu erhalten.",
        requiresSystemPrompt: true,
      }, { status: 400 })
    }

    // Get Gemini API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "GEMINI",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({
        error: "Kein aktiver Gemini API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu.",
      }, { status: 400 })
    }

    // Decrypt API key
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    // Parse brand style and content goals from JSON strings
    let brandStyle: string[] = []
    let contentGoals: string[] = []
    
    try {
      brandStyle = typeof user.brandStyle === "string" ? JSON.parse(user.brandStyle) : []
    } catch { brandStyle = [] }
    
    try {
      contentGoals = typeof user.contentGoals === "string" ? JSON.parse(user.contentGoals) : []
    } catch { contentGoals = [] }

    // Generate ideas using Gemini
    const ideas = await generateSeasonalIdeas(
      geminiKey,
      user.systemPrompt,
      {
        brandName: user.brandName || undefined,
        industry: user.industry || undefined,
        targetAudience: user.targetAudience || undefined,
        brandStyle,
        contentGoals,
      },
      month,
      year,
      data.locale || user.locale || "de",
      data.count
    )

    // Filter by content types if specified
    let filteredIdeas = ideas
    if (data.contentTypes && data.contentTypes.length > 0) {
      filteredIdeas = ideas.filter((idea: { contentType: string }) => 
        data.contentTypes!.includes(idea.contentType as "image" | "video" | "carousel")
      )
    }

    return NextResponse.json({
      success: true,
      ideas: filteredIdeas,
      meta: {
        month,
        year,
        locale: data.locale || user.locale || "de",
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error generating seasonal ideas:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Fehler beim Generieren der saisonalen Ideen",
    }, { status: 500 })
  }
}

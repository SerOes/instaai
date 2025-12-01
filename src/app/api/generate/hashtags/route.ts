import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const hashtagSchema = z.object({
  projectId: z.string().cuid().optional(),
  description: z.string().min(1, "Beschreibung erforderlich"),
  niche: z.string().optional(),
  count: z.number().min(5).max(30).default(15),
  mixType: z.enum(["popular", "niche", "mixed"]).default("mixed"),
  language: z.enum(["de", "en", "tr", "both"]).default("de"),
  model: z.enum(["gemini-2.5-flash", "gemini-3.0-pro"]).default("gemini-2.5-flash"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = hashtagSchema.parse(body)

    // Get user's API key and profile for Gemini
    const [apiKey, user] = await Promise.all([
      prisma.apiKey.findFirst({
        where: {
          userId: session.user.id,
          provider: "GEMINI",
          isActive: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          systemPrompt: true,
          brandName: true,
          industry: true,
          targetAudience: true,
        },
      }),
    ])

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Kein aktiver Gemini API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu." 
      }, { status: 400 })
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    // Build brand context from systemPrompt
    const brandContext = user?.systemPrompt
      ? `\nMarken-Kontext (verwende passende Marken-Hashtags):\n${user.systemPrompt}\n`
      : user?.brandName
      ? `\nMarke: ${user.brandName}${user.industry ? ` (Branche: ${user.industry})` : ""}${user.targetAudience ? ` - Zielgruppe: ${user.targetAudience}` : ""}\n`
      : ""

    const mixTypeDescriptions = {
      popular: "nur sehr beliebte Hashtags mit hohem Suchvolumen (1M+ Posts)",
      niche: "nur spezifische Nischen-Hashtags mit weniger Konkurrenz (10k-100k Posts)",
      mixed: "eine Mischung aus beliebten (30%), mittelgroßen (40%) und Nischen-Hashtags (30%)",
    }

    const languageInstruction: Record<string, string> = {
      de: "Generiere deutsche Hashtags.",
      en: "Generate English hashtags.",
      tr: "Türkçe hashtag'ler oluştur.",
      both: "Generiere eine Mischung aus deutschen und englischen Hashtags.",
    }

    const nicheContext = data.niche 
      ? `Die Nische/Branche ist: ${data.niche}` 
      : ""

    const prompt = `Generiere ${data.count} optimale Instagram-Hashtags für folgenden Content:
${brandContext}
Beschreibung: ${data.description}
${nicheContext}

Anforderungen:
- ${mixTypeDescriptions[data.mixType]}
- ${languageInstruction[data.language]}
- Hashtags müssen relevant und aktuell sein
- Keine verbotenen oder shadowbanned Hashtags
- Wenn Marken-Kontext vorhanden, füge passende Marken-/Branchen-Hashtags hinzu
- Formatiere sie als Liste, ein Hashtag pro Zeile
- Beginne jeden Hashtag mit #

Gib NUR die Hashtags aus, ohne zusätzliche Erklärungen.`

    // Call Gemini API with selected model
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${data.model}:generateContent?key=${geminiKey}`,
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
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error("Gemini API Error:", errorData)
      return NextResponse.json({ 
        error: "Fehler bei der Generierung. Bitte überprüfen Sie Ihren API-Schlüssel." 
      }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    const rawHashtags = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Parse hashtags into array
    const hashtags = rawHashtags
      .split("\n")
      .map((h: string) => h.trim())
      .filter((h: string) => h.startsWith("#"))
      .slice(0, data.count)

    // Format for easy copy-paste
    const formattedHashtags = hashtags.join(" ")

    return NextResponse.json({ 
      hashtags,
      formattedHashtags,
      count: hashtags.length,
      mixType: data.mixType,
      language: data.language,
    })
  } catch (error) {
    console.error("Error generating hashtags:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Hashtag-Generierung" }, { status: 500 })
  }
}

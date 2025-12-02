import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { decryptApiKey } from "@/lib/utils"

type RefineAction = 
  | "shorten"      // Kürzer machen
  | "lengthen"     // Länger machen  
  | "more_emojis"  // Mehr Emojis
  | "less_emojis"  // Weniger Emojis
  | "more_cta"     // Stärkerer Call-to-Action
  | "more_emotion" // Emotionaler
  | "professional" // Professioneller
  | "casual"       // Lockerer/Casual
  | "question"     // Als Frage formulieren
  | "story"        // Storytelling hinzufügen
  | "custom"       // Custom instruction

const ACTION_PROMPTS: Record<string, string> = {
  shorten: `Kürze den folgenden Instagram-Text auf maximal 150 Zeichen. Behalte die Kernaussage und wichtigste Emojis bei.`,
  lengthen: `Erweitere den folgenden Instagram-Text auf ca. 250-300 Zeichen. Füge mehr Details, Kontext oder eine kleine Geschichte hinzu.`,
  more_emojis: `Füge 3-5 passende Emojis zum folgenden Instagram-Text hinzu. Platziere sie sinnvoll im Text, nicht nur am Ende.`,
  less_emojis: `Reduziere die Emojis im folgenden Instagram-Text auf maximal 2-3. Behalte nur die wichtigsten.`,
  more_cta: `Verstärke den Call-to-Action im folgenden Instagram-Text. Füge eine klare Handlungsaufforderung hinzu (z.B. "Schreib mir in die Kommentare...", "Link in Bio", "Teile mit einem Freund...").`,
  more_emotion: `Mache den folgenden Instagram-Text emotionaler und persönlicher. Füge Gefühle, persönliche Note oder eine emotionale Verbindung hinzu.`,
  professional: `Formuliere den folgenden Instagram-Text professioneller und geschäftsmäßiger, aber behalte die Wärme bei.`,
  casual: `Formuliere den folgenden Instagram-Text lockerer und umgangssprachlicher. Wie ein Gespräch mit einem Freund.`,
  question: `Beginne den folgenden Instagram-Text mit einer ansprechenden Frage an die Leser.`,
  story: `Füge ein kurzes Storytelling-Element zum folgenden Instagram-Text hinzu. Eine Mini-Geschichte oder persönliche Anekdote.`,
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { caption, action, customInstruction } = body

    if (!caption || typeof caption !== 'string') {
      return NextResponse.json({ error: "Caption erforderlich" }, { status: 400 })
    }

    if (!action || !Object.keys(ACTION_PROMPTS).includes(action)) {
      return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 })
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
        error: "Gemini API-Key nicht konfiguriert"
      }, { status: 400 })
    }

    const geminiApiKey = decryptApiKey(apiKey.keyEncrypted)

    // Build the prompt
    let actionPrompt = ACTION_PROMPTS[action] || ACTION_PROMPTS.shorten
    if (action === "custom" && customInstruction) {
      actionPrompt = customInstruction
    }

    const fullPrompt = `${actionPrompt}

WICHTIG: 
- Behalte den grundlegenden Inhalt und die Bedeutung bei
- Antworte NUR mit dem bearbeiteten Text, keine Erklärungen
- Keine Anführungszeichen um den Text

ORIGINAL-TEXT:
${caption}

BEARBEITETER TEXT:`

    // Call Gemini 2.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      throw new Error(errorData.error?.message || 'Gemini API request failed')
    }

    const data = await response.json()
    let refinedCaption = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Clean up the response
    refinedCaption = refinedCaption
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^BEARBEITETER TEXT:\s*/i, '')
      .trim()

    return NextResponse.json({
      caption: refinedCaption,
      action,
    })
  } catch (error) {
    console.error("Caption refine error:", error)
    return NextResponse.json(
      { error: "Fehler bei der Text-Bearbeitung" },
      { status: 500 }
    )
  }
}

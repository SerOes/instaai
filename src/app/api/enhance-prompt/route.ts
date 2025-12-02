import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Google Nano Banana Pro Prompting Guidelines
const PROMPT_ENHANCEMENT_SYSTEM = `Du bist ein Experte für KI-Bildgenerierung und hilfst dabei, Benutzer-Prompts zu optimieren. 

Verwende die folgenden Guidelines von Google Nano Banana Pro, um Prompts zu verbessern:

## KERNELEMENTE EINES GUTEN PROMPTS:

1. **SUBJEKT** - Wer oder was ist im Bild?
   - Sei spezifisch: Anzahl, Eigenschaften, Details
   - Beispiel: "Eine ältere Frau mit silbergrauem Haar und Lesebrille" statt "eine Frau"

2. **KOMPOSITION** - Wie ist das Bild gerahmt?
   - Shot-Type: Nahaufnahme, Medium-Shot, Weitwinkel, Vogelperspektive, etc.
   - Blickwinkel: Von unten, von oben, Augenhöhe, etc.
   - Beispiel: "Nahaufnahme von der Seite"

3. **AKTION** - Was passiert im Bild?
   - Beschreibe Aktivitäten, Bewegungen, Interaktionen
   - Beispiel: "liest ein altes, ledergebundenes Buch bei Kerzenlicht"

4. **ORT/SETTING** - Wo spielt die Szene?
   - Umgebung, Zeit, Atmosphäre
   - Beispiel: "in einer gemütlichen Bibliothek mit Holzregalen"

5. **STIL** - Welche Ästhetik soll das Bild haben?
   - Kunststil: fotorealistisch, Aquarell, Ölgemälde, etc.
   - Stimmung: warm, dramatisch, verträumt, etc.
   - Beispiel: "im Stil eines niederländischen Meisters, warme Beleuchtung"

## ZUSÄTZLICHE TIPPS:

- **Kamera-Details**: "35mm Film", "DSLR", "Tilt-Shift", "Bokeh"
- **Beleuchtung**: "Golden Hour", "Studio-Beleuchtung", "Neonlicht", "Gegenlicht"
- **Texturen & Materialien**: Detaillierte Oberflächenbeschreibungen
- **Negative Aspekte vermeiden**: Sage was du WILLST, nicht was du NICHT willst

## DEINE AUFGABE:

Verbessere den gegebenen Prompt, indem du:
1. Fehlende Elemente (Subjekt, Komposition, Aktion, Ort, Stil) ergänzt
2. Vage Beschreibungen konkretisierst
3. Visuelle Details hinzufügst die zum Kontext passen
4. Den Stil und die Stimmung verstärkst
5. Die Sprache natürlich und fließend hältst

WICHTIG:
- Behalte die Kernidee des ursprünglichen Prompts bei
- Übertreibe nicht - der Prompt sollte fokussiert bleiben
- Wenn Bildanalyse-Daten vorliegen, nutze diese für Kontext
- Antworte NUR mit dem verbesserten Prompt, keine Erklärungen
- Der Prompt soll auf ENGLISCH sein (für beste KI-Ergebnisse)
- Wenn ein System-Prompt/Brand-Kontext gegeben ist, berücksichtige diesen`

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, imageAnalysis, targetCategory } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Prompt ist erforderlich" },
        { status: 400 }
      )
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
        error: "Gemini API-Key nicht konfiguriert. Bitte unter Einstellungen hinzufügen."
      }, { status: 400 })
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiApiKey = decryptApiKey(apiKey.keyEncrypted)

    // Get user's system prompt for brand context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true }
    })

    // Build the enhancement request
    let enhancementPrompt = `Verbessere diesen Prompt für die KI-Bildgenerierung:\n\n"${prompt}"`

    // Add image analysis context if available
    if (imageAnalysis) {
      enhancementPrompt += `\n\n## Bildanalyse-Daten (vom hochgeladenen Referenzbild):\n`
      if (imageAnalysis.productName) {
        enhancementPrompt += `- Produkt: ${imageAnalysis.productName}\n`
      }
      if (imageAnalysis.description) {
        enhancementPrompt += `- Beschreibung: ${imageAnalysis.description}\n`
      }
      if (imageAnalysis.colors?.length > 0) {
        enhancementPrompt += `- Farben: ${imageAnalysis.colors.join(', ')}\n`
      }
      if (imageAnalysis.mood) {
        enhancementPrompt += `- Stimmung: ${imageAnalysis.mood}\n`
      }
      if (imageAnalysis.suggestedStyle) {
        enhancementPrompt += `- Vorgeschlagener Stil: ${imageAnalysis.suggestedStyle}\n`
      }
      if (imageAnalysis.composition) {
        enhancementPrompt += `- Komposition: ${imageAnalysis.composition}\n`
      }
    }

    // Add target category context if specified
    if (targetCategory) {
      const categoryContexts: Record<string, string> = {
        'product': 'Fokus auf E-Commerce/Produktfotografie - professionell, verkaufsfördernd',
        'lifestyle': 'Fokus auf Lifestyle-Szene mit dem Produkt im natürlichen Kontext',
        'portrait': 'Fokus auf Portrait/Personenfotografie',
        'food': 'Fokus auf Food-Fotografie - appetitlich, professionell',
        'pet': 'Fokus auf Tierfotografie - natürlich, emotional',
        'social': 'Optimiert für Social Media - auffällig, engagement-fördernd',
        'brand': 'Fokus auf Markenidentität und -konsistenz',
        'other': 'Allgemeine hochwertige Bildgenerierung'
      }
      if (categoryContexts[targetCategory]) {
        enhancementPrompt += `\n\n## Zielkategorie:\n${categoryContexts[targetCategory]}`
      }
    }

    // Add brand context from system prompt (shortened version)
    if (user?.systemPrompt) {
      // Extract only essential brand info
      const brandNameMatch = user.systemPrompt.match(/(?:Marke|Brand)[:\s]+[„"']?([^„"'\n]+)[„"']?/i)
      const styleMatch = user.systemPrompt.match(/(?:Markenstil|Style)[:\s]+([^\n]+)/i)
      
      const essentialBrand: string[] = []
      if (brandNameMatch) essentialBrand.push(`Marke: ${brandNameMatch[1].trim()}`)
      if (styleMatch) {
        const styleWords = styleMatch[1].split(/[,.]/).slice(0, 4).map(s => s.trim()).filter(Boolean)
        if (styleWords.length > 0) essentialBrand.push(`Stil: ${styleWords.join(', ')}`)
      }
      
      if (essentialBrand.length > 0) {
        enhancementPrompt += `\n\n## Markenkontext (kurz):\n${essentialBrand.join('\n')}`
      }
    }

    enhancementPrompt += `\n\n---\nAntworte NUR mit dem verbesserten Prompt auf Englisch, ohne Erklärungen oder Anführungszeichen.`

    // Call Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT_ENHANCEMENT_SYSTEM + "\n\n" + enhancementPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Gemini API error:", errorData)
      return NextResponse.json(
        { error: "Fehler bei der Gemini API" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const enhancedPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!enhancedPrompt) {
      return NextResponse.json(
        { error: "Keine Antwort vom KI-Modell erhalten" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      originalPrompt: prompt,
      enhancedPrompt,
      usedBrandContext: !!user?.systemPrompt
    })

  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return NextResponse.json(
      { error: "Fehler bei der Prompt-Verbesserung" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const analyzeSchema = z.object({
  // Accept both full URLs and relative paths (like /uploads/...)
  imageUrl: z.string().min(1, "Gültige Bild-URL erforderlich").refine(
    (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
    "Gültige Bild-URL oder relativer Pfad erforderlich"
  ),
})

// POST /api/analyze/image - Analyze image with Gemini 2.5 Flash
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl } = analyzeSchema.parse(body)

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
        error: "Gemini API-Key nicht konfiguriert",
        analysis: getDefaultAnalysis()
      }, { status: 200 })
    }

    // Decrypt the API key (stored as base64)
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiApiKey = decryptApiKey(apiKey.keyEncrypted)

    // Call Gemini 2.5 Flash Vision API
    const analysis = await analyzeImageWithGemini(geminiApiKey, imageUrl)

    return NextResponse.json({ 
      analysis,
      message: "Bild erfolgreich analysiert"
    })
  } catch (error) {
    console.error("Image analysis error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    // Return default analysis on error
    return NextResponse.json({ 
      analysis: getDefaultAnalysis(),
      error: "Analyse fehlgeschlagen, Standard-Werte verwendet"
    }, { status: 200 })
  }
}

function getDefaultAnalysis() {
  return {
    productName: null,
    productType: null,
    colors: [],
    mood: null,
    description: null,
    suggestedStyle: null,
  }
}

async function analyzeImageWithGemini(apiKey: string, imageUrl: string) {
  const prompt = `Analysiere dieses Bild für Instagram Content-Erstellung. Antworte NUR mit einem validen JSON-Objekt (keine Markdown-Formatierung, kein \`\`\`json).

Das JSON soll folgende Felder haben:
{
  "productName": "Name des Produkts (kurz, max 50 Zeichen)",
  "productType": "Kategorie z.B. Kleidung, Dekoration, Essen",
  "colors": ["#HEX1", "#HEX2", "#HEX3"],
  "mood": "Stimmung z.B. warm, kühl, verspielt",
  "description": "Kurze Beschreibung (max 80 Zeichen)",
  "suggestedStyle": "Stil z.B. minimalistisch, lifestyle"
}

Halte alle Texte kurz und prägnant!`

  try {
    // Convert relative URL to absolute URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const absoluteImageUrl = imageUrl.startsWith('/')
      ? `${baseUrl}${imageUrl}`
      : imageUrl

    console.log('Fetching image from:', absoluteImageUrl)

    // Fetch the image and convert to base64
    const imageResponse = await fetch(absoluteImageUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

    console.log('Image fetched, size:', imageBuffer.byteLength, 'bytes, type:', mimeType)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
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
    console.log('Gemini response received:', JSON.stringify(data).substring(0, 500))
    
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('Text content:', textContent)

    // Parse the JSON response
    let jsonStr = textContent.trim()
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    // Try to fix common JSON issues
    // If JSON is truncated, try to complete it
    if (!jsonStr.endsWith('}')) {
      // Find the last complete field and close the JSON
      const lastCompleteField = jsonStr.lastIndexOf('",')
      if (lastCompleteField > 0) {
        jsonStr = jsonStr.substring(0, lastCompleteField + 1) + '}'
      }
    }

    console.log('Cleaned JSON string:', jsonStr)

    let analysis
    try {
      analysis = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error, trying to extract fields manually')
      // Try to extract what we can from the partial JSON
      analysis = {
        productName: extractJsonField(textContent, 'productName'),
        productType: extractJsonField(textContent, 'productType'),
        colors: extractJsonArray(textContent, 'colors'),
        mood: extractJsonField(textContent, 'mood'),
        description: extractJsonField(textContent, 'description'),
        suggestedStyle: extractJsonField(textContent, 'suggestedStyle'),
      }
    }
    
    console.log('Analysis result:', analysis)
    
    return {
      productName: analysis.productName || null,
      productType: analysis.productType || null,
      colors: Array.isArray(analysis.colors) ? analysis.colors : [],
      mood: analysis.mood || null,
      description: analysis.description || null,
      suggestedStyle: analysis.suggestedStyle || null,
    }
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return getDefaultAnalysis()
  }
}

// Helper function to extract a string field from partial JSON
function extractJsonField(text: string, fieldName: string): string | null {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i')
  const match = text.match(regex)
  return match ? match[1] : null
}

// Helper function to extract an array field from partial JSON
function extractJsonArray(text: string, fieldName: string): string[] {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*)\\]`, 'i')
  const match = text.match(regex)
  if (match) {
    // Extract strings from the array content
    const arrayContent = match[1]
    const items = arrayContent.match(/"([^"]*)"/g)
    return items ? items.map(item => item.replace(/"/g, '')) : []
  }
  return []
}

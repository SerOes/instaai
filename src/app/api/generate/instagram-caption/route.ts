import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { decryptApiKey } from "@/lib/utils"

interface BrandContext {
  systemPrompt: string | null
  brandName: string | null
  industry: string | null
  targetAudience: string | null
  brandStyle: string[]
  contentGoals: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, imageAnalysis, prompt: originalPrompt, language = "de" } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Bild-URL erforderlich" }, { status: 400 })
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

    const geminiApiKey = decryptApiKey(apiKey.keyEncrypted)

    // Fetch user's brand context (System Prompt settings)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        systemPrompt: true,
        brandName: true,
        industry: true,
        targetAudience: true,
        brandStyle: true,
        contentGoals: true,
      },
    })

    // Parse brand context
    const brandContext: BrandContext = {
      systemPrompt: user?.systemPrompt || null,
      brandName: user?.brandName || null,
      industry: user?.industry || null,
      targetAudience: user?.targetAudience || null,
      brandStyle: [],
      contentGoals: [],
    }

    // Parse JSON arrays from SQLite
    try {
      brandContext.brandStyle = typeof user?.brandStyle === 'string' ? JSON.parse(user.brandStyle) : []
    } catch { brandContext.brandStyle = [] }
    
    try {
      brandContext.contentGoals = typeof user?.contentGoals === 'string' ? JSON.parse(user.contentGoals) : []
    } catch { brandContext.contentGoals = [] }

    // Build the system prompt for Instagram caption generation
    const systemPrompt = buildInstagramCaptionSystemPrompt(brandContext, language)

    // Build the user prompt with context
    const userPrompt = buildUserPrompt(imageAnalysis, originalPrompt, language)

    // Fetch the image and convert to base64
    let imageBase64: string | null = null
    let mimeType = "image/png"
    
    try {
      // Convert relative URL to absolute URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const absoluteImageUrl = imageUrl.startsWith('/')
        ? `${baseUrl}${imageUrl}`
        : imageUrl

      const imageResponse = await fetch(absoluteImageUrl)
      if (imageResponse.ok) {
        const contentType = imageResponse.headers.get("content-type")
        if (contentType) {
          mimeType = contentType
        }
        const arrayBuffer = await imageResponse.arrayBuffer()
        imageBase64 = Buffer.from(arrayBuffer).toString("base64")
      }
    } catch (error) {
      console.error("Error fetching image:", error)
      // Continue without image if it fails
    }

    // Call Gemini 2.5 Flash API
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
    
    const requestBody: Record<string, unknown> = {
      contents: [
        {
          parts: imageBase64 
            ? [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
                { text: fullPrompt },
              ]
            : [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1500,
      },
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      throw new Error(errorData.error?.message || 'Gemini API request failed')
    }

    const data = await response.json()
    console.log("Gemini raw response:", JSON.stringify(data).substring(0, 1000))
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    if (!text) {
      console.error("Empty response from Gemini:", data)
      throw new Error("Keine Antwort von Gemini erhalten")
    }
    
    console.log("Gemini text response:", text.substring(0, 500))

    // Parse the response to extract caption and hashtags
    const result = parseInstagramResponse(text)

    return NextResponse.json({
      caption: result.caption,
      hashtags: result.hashtags,
      fullText: result.fullText,
      brandContextUsed: !!brandContext.systemPrompt || !!brandContext.brandName,
    })
  } catch (error) {
    console.error("Instagram caption generation error:", error)
    return NextResponse.json(
      { error: "Fehler bei der Caption-Generierung" },
      { status: 500 }
    )
  }
}

function buildInstagramCaptionSystemPrompt(brandContext: BrandContext, language: string): string {
  const isGerman = language === "de"
  
  let systemPrompt = isGerman
    ? `Du bist ein erfahrener Social-Media-Copywriter, spezialisiert auf Instagram-Content.`
    : `You are an experienced social media copywriter, specialized in Instagram content.`

  // Add brand context if available
  if (brandContext.systemPrompt) {
    systemPrompt += `\n\n### MARKEN-KONTEXT:\n${brandContext.systemPrompt}`
  } else {
    if (brandContext.brandName) {
      systemPrompt += `\n\n### MARKEN-KONTEXT:`
      systemPrompt += `\nMarke: ${brandContext.brandName}`
    }
    if (brandContext.industry) {
      systemPrompt += `\nBranche: ${brandContext.industry}`
    }
    if (brandContext.targetAudience) {
      systemPrompt += `\nZielgruppe: ${brandContext.targetAudience}`
    }
    if (brandContext.brandStyle.length > 0) {
      systemPrompt += `\nMarkenstil: ${brandContext.brandStyle.join(", ")}`
    }
    if (brandContext.contentGoals.length > 0) {
      systemPrompt += `\nContent-Ziele: ${brandContext.contentGoals.join(", ")}`
    }
  }

  // Add instructions
  systemPrompt += isGerman
    ? `\n\n### AUFGABE:
Erstelle einen Instagram-Post-Text (Caption) für das gezeigte/beschriebene Bild.

### ANFORDERUNGEN:
1. **Caption**: Schreibe eine ansprechende, emotionale Caption (150-300 Zeichen ideal)
   - Beginne mit einem Hook (Frage, Statement, Emoji)
   - Erzähle eine kurze Geschichte oder schaffe Verbindung
   - Füge einen Call-to-Action hinzu (Kommentieren, Teilen, Link in Bio)
   - Verwende passende Emojis sparsam aber effektiv
   
2. **Hashtags**: Erstelle 15-25 relevante Hashtags
   - Mix aus populären (#inspiration) und nischen-spezifischen Tags
   - Marken-relevante Hashtags wenn möglich
   - Deutsche UND englische Hashtags mischen
   - Sortiere nach Relevanz (wichtigste zuerst)

### FORMAT:
Antworte EXAKT in diesem Format:

---CAPTION---
[Deine Caption hier mit Emojis und Zeilenumbrüchen]

---HASHTAGS---
#hashtag1 #hashtag2 #hashtag3 ...

---ENDE---`
    : `\n\n### TASK:
Create an Instagram post caption for the shown/described image.

### REQUIREMENTS:
1. **Caption**: Write an engaging, emotional caption (150-300 characters ideal)
   - Start with a hook (question, statement, emoji)
   - Tell a short story or create connection
   - Add a call-to-action (comment, share, link in bio)
   - Use relevant emojis sparingly but effectively
   
2. **Hashtags**: Create 15-25 relevant hashtags
   - Mix of popular (#inspiration) and niche-specific tags
   - Brand-relevant hashtags if possible
   - Sort by relevance (most important first)

### FORMAT:
Reply EXACTLY in this format:

---CAPTION---
[Your caption here with emojis and line breaks]

---HASHTAGS---
#hashtag1 #hashtag2 #hashtag3 ...

---END---`

  return systemPrompt
}

function buildUserPrompt(
  imageAnalysis: { productName?: string; productType?: string; mood?: string; colors?: string[]; description?: string } | null,
  originalPrompt: string | null,
  language: string
): string {
  const isGerman = language === "de"
  
  let userPrompt = isGerman 
    ? "Analysiere das Bild und erstelle den Instagram-Content:"
    : "Analyze the image and create the Instagram content:"

  // Add context from image analysis
  if (imageAnalysis) {
    userPrompt += isGerman ? "\n\n### BILD-ANALYSE:" : "\n\n### IMAGE ANALYSIS:"
    
    if (imageAnalysis.productName) {
      userPrompt += `\n- Produkt: ${imageAnalysis.productName}`
    }
    if (imageAnalysis.productType) {
      userPrompt += `\n- Typ: ${imageAnalysis.productType}`
    }
    if (imageAnalysis.mood) {
      userPrompt += `\n- Stimmung: ${imageAnalysis.mood}`
    }
    if (imageAnalysis.colors && imageAnalysis.colors.length > 0) {
      userPrompt += `\n- Farben: ${imageAnalysis.colors.join(", ")}`
    }
    if (imageAnalysis.description) {
      userPrompt += `\n- Beschreibung: ${imageAnalysis.description}`
    }
  }

  // Add original prompt context if available
  if (originalPrompt) {
    userPrompt += isGerman 
      ? `\n\n### ORIGINAL-PROMPT:\n${originalPrompt}`
      : `\n\n### ORIGINAL PROMPT:\n${originalPrompt}`
  }

  return userPrompt
}

function parseInstagramResponse(text: string): {
  caption: string
  hashtags: string[]
  fullText: string
} {
  // Default values
  let caption = ""
  let hashtags: string[] = []

  console.log("Parsing Instagram response, length:", text.length)
  console.log("First 500 chars:", text.substring(0, 500))

  // Method 1: Try to parse the structured response with markers
  const captionMatch = text.match(/---\s*CAPTION\s*---\s*([\s\S]*?)\s*---\s*HASHTAGS?\s*---/i)
  const hashtagsMatch = text.match(/---\s*HASHTAGS?\s*---\s*([\s\S]*?)\s*(?:---\s*(?:ENDE|END)\s*---|$)/i)

  if (captionMatch && captionMatch[1]) {
    caption = captionMatch[1].trim()
    caption = caption.replace(/---\s*(CAPTION|HASHTAGS?|ENDE|END)\s*---/gi, '').trim()
    console.log("Method 1: Found caption with markers")
  }

  if (hashtagsMatch && hashtagsMatch[1]) {
    let hashtagsText = hashtagsMatch[1].trim()
    hashtagsText = hashtagsText.replace(/---\s*(CAPTION|HASHTAGS?|ENDE|END)\s*---/gi, '').trim()
    const hashtagMatches = hashtagsText.match(/#[\wäöüÄÖÜß]+/gi)
    if (hashtagMatches) {
      hashtags = hashtagMatches
      console.log("Method 1: Found hashtags with markers:", hashtags.length)
    }
  }

  // Method 2: If no markers found, try to split by hashtags section
  if (!caption) {
    // Look for a block of hashtags (multiple #tags together)
    const hashtagBlockMatch = text.match(/((?:#[\wäöüÄÖÜß]+\s*){5,})/i)
    if (hashtagBlockMatch) {
      const hashtagBlock = hashtagBlockMatch[1]
      const hashtagStart = text.indexOf(hashtagBlock)
      
      // Everything before hashtag block is caption
      if (hashtagStart > 10) {
        caption = text.substring(0, hashtagStart).trim()
        // Clean up the caption
        caption = caption
          .replace(/---\s*\w+\s*---/gi, '')
          .replace(/^(Caption|Text|Hashtags?)[:：]\s*/gim, '')
          .trim()
        console.log("Method 2: Found caption before hashtag block")
      }
      
      // Extract hashtags from block
      const allHashtags = hashtagBlock.match(/#[\wäöüÄÖÜß]+/gi)
      if (allHashtags) {
        hashtags = allHashtags
        console.log("Method 2: Found hashtags:", hashtags.length)
      }
    }
  }

  // Method 3: If still no caption, try line-by-line parsing
  if (!caption) {
    console.log("Method 3: Line-by-line parsing")
    const lines = text.split('\n')
    const captionLines: string[] = []
    const hashtagLines: string[] = []
    
    let inHashtagSection = false
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip empty lines and marker lines
      if (!trimmedLine || /^---/.test(trimmedLine)) continue
      
      // Check if this line is mostly hashtags
      const tagMatches = trimmedLine.match(/#[\wäöüÄÖÜß]+/gi)
      const isHashtagLine = tagMatches && (
        tagMatches.length >= 3 || 
        trimmedLine.startsWith('#') ||
        inHashtagSection
      )
      
      if (isHashtagLine && tagMatches) {
        inHashtagSection = true
        hashtagLines.push(...tagMatches)
      } else if (!inHashtagSection && trimmedLine.length > 3) {
        captionLines.push(trimmedLine)
      }
    }
    
    if (captionLines.length > 0) {
      caption = captionLines.join('\n').trim()
      // Clean up any labels
      caption = caption.replace(/^(Caption|Text)[:：]\s*/i, '').trim()
    }
    
    if (hashtagLines.length > 0) {
      hashtags = hashtagLines
    }
  }

  // Method 4: Last resort - extract any text and hashtags
  if (!caption && text.length > 20) {
    console.log("Method 4: Last resort extraction")
    // Remove all hashtags and markers to get caption
    caption = text
      .replace(/---\s*\w+\s*---/gi, '')
      .replace(/#[\wäöüÄÖÜß]+/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 3)
      .slice(0, 8)
      .join('\n')
      .trim()
    
    // Extract all hashtags from original text
    const allHashtags = text.match(/#[\wäöüÄÖÜß]+/gi)
    if (allHashtags) {
      hashtags = [...new Set(allHashtags)] // Remove duplicates
    }
  }

  // Final cleanup
  caption = caption
    .replace(/^---.*?---\s*/gm, '')
    .replace(/\s*---.*?---$/gm, '')
    .replace(/^(Caption|Text|Hashtags?)[:：]\s*/gim, '')
    .trim()

  console.log("Final caption length:", caption.length)
  console.log("Final hashtags count:", hashtags.length)

  // Build full text for easy copying
  const fullText = caption + (hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '')

  return { caption, hashtags, fullText }
}

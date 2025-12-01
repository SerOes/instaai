import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const captionSchema = z.object({
  projectId: z.string().cuid().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().min(1, "Beschreibung erforderlich"),
  style: z.enum(["casual", "professional", "humorous", "inspirational", "storytelling"]).default("casual"),
  language: z.enum(["de", "en", "tr"]).default("de"),
  includeEmojis: z.boolean().default(true),
  maxLength: z.number().min(50).max(2200).default(500),
  model: z.enum(["gemini-2.5-flash", "gemini-3.0-pro"]).default("gemini-2.5-flash"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = captionSchema.parse(body)

    // Get user's API key for Gemini
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

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const geminiKey = decryptApiKey(apiKey.keyEncrypted)

    // Get user's system prompt for brand consistency
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true, brandName: true },
    })

    // Build the prompt based on style and language
    const stylePrompts = {
      casual: "locker und freundlich, wie ein Gespräch mit Freunden",
      professional: "professionell und informativ, aber dennoch ansprechend",
      humorous: "witzig und unterhaltsam mit einem Augenzwinkern",
      inspirational: "inspirierend und motivierend",
      storytelling: "als kleine Geschichte erzählt",
    }

    const languageInstruction = data.language === "de" 
      ? "Schreibe die Caption auf Deutsch." 
      : "Write the caption in English."

    const emojiInstruction = data.includeEmojis 
      ? "Verwende passende Emojis, um den Text lebendiger zu machen."
      : "Verwende keine Emojis."

    // Include user's brand context if available
    const brandContext = user?.systemPrompt 
      ? `\nMarken-Kontext:\n${user.systemPrompt}\n`
      : ""

    const prompt = `Erstelle eine Instagram-Caption für folgendes Bild/Thema:
${brandContext}
Beschreibung: ${data.description}

Anforderungen:
- Stil: ${stylePrompts[data.style]}
- ${languageInstruction}
- ${emojiInstruction}
- Maximale Länge: ${data.maxLength} Zeichen
- Füge einen Call-to-Action hinzu, der zur Interaktion einlädt
- Die Caption soll authentisch und zur Marke passend sein

Gib NUR die Caption aus, ohne zusätzliche Erklärungen.`

    // Call Gemini API with user-selected model (default: gemini-2.5-flash)
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
            temperature: 0.8,
            maxOutputTokens: 1024,
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
    const caption = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Save caption if projectId is provided
    if (data.projectId) {
      // Verify project belongs to user
      const project = await prisma.mediaProject.findFirst({
        where: {
          id: data.projectId,
          userId: session.user.id,
        },
      })

      if (project) {
        await prisma.caption.create({
          data: {
            projectId: data.projectId,
            text: caption,
            tone: data.style,
            language: data.language,
            // hashtags defaults to "[]" in schema
            isSelected: false,
          },
        })
      }
    }

    return NextResponse.json({ 
      caption,
      style: data.style,
      language: data.language,
    })
  } catch (error) {
    console.error("Error generating caption:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Caption-Generierung" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const imageSchema = z.object({
  prompt: z.string().min(10, "Prompt muss mindestens 10 Zeichen haben"),
  negativePrompt: z.string().optional(),
  style: z.string().optional(),
  presetId: z.string().optional(),
  aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  model: z.enum(["kie-standard", "kie-realistic", "kie-artistic"]).default("kie-standard"),
  projectId: z.string().cuid().optional(),
  referenceImageUrl: z.string().optional(),
  referenceImageId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = imageSchema.parse(body)

    // Get user with systemPrompt and API key for KIE.ai
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true },
    })

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "KIE",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ 
        error: "Kein aktiver KIE.ai API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu." 
      }, { status: 400 })
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const kieKey = decryptApiKey(apiKey.keyEncrypted)

    // Build enhanced prompt with preset and system prompt
    let enhancedPrompt = data.prompt
    let styleUsed = data.style

    // Apply preset template if selected
    if (data.presetId) {
      const preset = await prisma.aiPreset.findUnique({
        where: { id: data.presetId },
      })
      
      if (preset && preset.promptTemplate) {
        enhancedPrompt = `${preset.promptTemplate}\n\n${data.prompt}`
        styleUsed = preset.name
      }
    }

    // Add user's global system prompt for brand consistency
    if (user?.systemPrompt) {
      enhancedPrompt = `Brand Context:\n${user.systemPrompt}\n\n${enhancedPrompt}`
    }

    // Get resolution based on aspect ratio
    const resolutions = {
      "1:1": { width: 1024, height: 1024 },
      "4:5": { width: 1024, height: 1280 },
      "9:16": { width: 768, height: 1365 },
      "16:9": { width: 1365, height: 768 },
    }

    const resolution = resolutions[data.aspectRatio]

    // Call KIE.ai API for image generation
    // Note: This is a placeholder - actual KIE.ai API endpoint and format may vary
    const requestBody: Record<string, unknown> = {
      prompt: enhancedPrompt,
      negative_prompt: data.negativePrompt || "",
      model: data.model,
      width: resolution.width,
      height: resolution.height,
      num_images: 1,
      style: styleUsed,
    }

    // Add reference image if provided (for image-to-image generation)
    if (data.referenceImageUrl) {
      // Convert relative URL to absolute URL for external API
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const absoluteUrl = data.referenceImageUrl.startsWith('/')
        ? `${baseUrl}${data.referenceImageUrl}`
        : data.referenceImageUrl
      
      requestBody.init_image = absoluteUrl
      requestBody.strength = 0.7 // How much to transform the reference (0.0-1.0)
      requestBody.mode = "img2img" // Switch to image-to-image mode
    }

    const kieResponse = await fetch("https://api.kie.ai/v1/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${kieKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!kieResponse.ok) {
      const errorData = await kieResponse.json().catch(() => ({}))
      console.error("KIE.ai API Error:", errorData)
      return NextResponse.json({ 
        error: "Fehler bei der Bildgenerierung. Bitte überprüfen Sie Ihren API-Schlüssel und versuchen Sie es erneut." 
      }, { status: 500 })
    }

    const kieData = await kieResponse.json()
    const imageUrl = kieData.images?.[0]?.url || kieData.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Keine Bild-URL in der Antwort erhalten" 
      }, { status: 500 })
    }

    // Save to project if projectId is provided
    if (data.projectId) {
      const project = await prisma.mediaProject.findFirst({
        where: {
          id: data.projectId,
          userId: session.user.id,
        },
      })

      if (project) {
        await prisma.mediaProject.update({
          where: { id: data.projectId },
          data: {
            fileUrl: imageUrl,
            thumbnailUrl: imageUrl,
            prompt: data.prompt,
            style: styleUsed,
            aspectRatio: data.aspectRatio,
            model: data.model,
            provider: "KIE",
            updatedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({ 
      imageUrl,
      prompt: data.prompt,
      enhancedPrompt: enhancedPrompt !== data.prompt ? enhancedPrompt : undefined,
      style: styleUsed,
      aspectRatio: data.aspectRatio,
      model: data.model,
      resolution,
      referenceImageUsed: data.referenceImageUrl ? true : false,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Bildgenerierung" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import {
  getVideoModel,
  VIDEO_MODELS,
  KIE_API,
  buildKieStandardPayload,
  buildVeoPayload,
  type KieCreateTaskResponse,
  type VeoGenerateResponse,
} from "@/lib/video-providers"

// Extended schema for video generation
const videoSchema = z.object({
  prompt: z.string().min(10, "Prompt muss mindestens 10 Zeichen haben"),
  imageUrl: z.string().url().optional(),
  tailImageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).max(3).optional(), // For Veo reference images
  presetId: z.string().optional(),
  aspectRatio: z.enum(["1:1", "9:16", "16:9"]).default("9:16"),
  duration: z.number().min(3).max(15).default(5),
  modelId: z.string().default("veo-3-1-fast"),
  resolution: z.enum(["480p", "720p", "1080p"]).optional(),
  negativePrompt: z.string().optional(),
  cfgScale: z.number().min(0).max(1).optional(),
  enableTranslation: z.boolean().optional(),
  watermark: z.string().optional(),
  projectId: z.string().cuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = videoSchema.parse(body)

    // Get the selected model
    const model = getVideoModel(data.modelId)
    if (!model) {
      return NextResponse.json({
        error: `Unbekanntes Video-Modell: ${data.modelId}. Verfügbare Modelle: ${VIDEO_MODELS.map(m => m.id).join(", ")}`,
      }, { status: 400 })
    }

    // Get user with systemPrompt
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true },
    })

    // Get API key for the provider
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "KIE",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({
        error: "Kein aktiver KIE.ai API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu.",
      }, { status: 400 })
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const kieKey = decryptApiKey(apiKey.keyEncrypted)

    // Build enhanced prompt with preset and system prompt
    let enhancedPrompt = data.prompt

    // Apply preset template if selected
    if (data.presetId) {
      const preset = await prisma.aiPreset.findUnique({
        where: { id: data.presetId },
      })

      if (preset?.promptTemplate) {
        enhancedPrompt = `${preset.promptTemplate}\n\n${data.prompt}`
      }
    }

    // Add user's global system prompt for brand consistency
    if (user?.systemPrompt) {
      enhancedPrompt = `Brand Guidelines:\n${user.systemPrompt}\n\n${enhancedPrompt}`
    }

    // Build the appropriate payload based on model
    let response: Response
    let taskId: string

    if (model.endpoint === KIE_API.veoGenerate) {
      // Veo models use special endpoint
      const imageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : undefined)
      
      const payload = buildVeoPayload(model, {
        prompt: enhancedPrompt,
        imageUrls,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        enableTranslation: data.enableTranslation,
        watermark: data.watermark,
      })

      console.log("Veo API Request:", JSON.stringify(payload, null, 2))

      response = await fetch(KIE_API.veoGenerate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Veo API Error:", response.status, errorText)
        return NextResponse.json({
          error: `Veo API Fehler: ${response.status} - ${errorText}`,
        }, { status: response.status })
      }

      const veoData: VeoGenerateResponse = await response.json()
      
      if (veoData.code !== 200) {
        return NextResponse.json({
          error: `Veo API Fehler: ${veoData.msg}`,
        }, { status: 400 })
      }

      taskId = veoData.data.taskId

    } else {
      // Standard KIE.AI models
      const payload = buildKieStandardPayload(model, {
        prompt: enhancedPrompt,
        imageUrl: data.imageUrl,
        tailImageUrl: data.tailImageUrl,
        duration: data.duration,
        resolution: data.resolution,
        negativePrompt: data.negativePrompt,
        cfgScale: data.cfgScale,
      })

      console.log("KIE API Request:", JSON.stringify(payload, null, 2))

      response = await fetch(KIE_API.createTask, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("KIE API Error:", response.status, errorText)
        return NextResponse.json({
          error: `KIE API Fehler: ${response.status} - ${errorText}`,
        }, { status: response.status })
      }

      const kieData: KieCreateTaskResponse = await response.json()
      
      if (kieData.code !== 200) {
        return NextResponse.json({
          error: `KIE API Fehler: ${kieData.msg}`,
        }, { status: 400 })
      }

      taskId = kieData.data.taskId
    }

    // Return the task ID for polling
    return NextResponse.json({
      status: "processing",
      taskId,
      message: "Video wird generiert. Nutzen Sie die Task-ID um den Status abzufragen.",
      model: {
        id: model.id,
        name: model.name,
        provider: model.provider,
      },
      parameters: {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        resolution: data.resolution,
      },
      projectId: data.projectId,
    })

  } catch (error) {
    console.error("Error generating video:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Videogenerierung" }, { status: 500 })
  }
}

// GET: List available video models
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Return available models with their features
    const models = VIDEO_MODELS.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      provider: model.provider,
      features: model.features,
      pricing: model.pricing,
    }))

    return NextResponse.json({ models })

  } catch (error) {
    console.error("Error fetching video models:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Modelle" }, { status: 500 })
  }
}

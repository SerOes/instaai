import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

const imageSchema = z.object({
  prompt: z.string().min(1, "Prompt ist erforderlich"),
  negativePrompt: z.string().optional(),
  style: z.string().optional(),
  presetId: z.string().optional(),
  aspectRatio: z.enum([
    "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "9:21", "auto"
  ]).default("1:1"),
  provider: z.enum(["kieai", "gemini"]).default("kieai"),
  model: z.string().default("nano-banana-pro"), // Default to nano-banana-pro
  projectId: z.string().cuid().optional(),
  // Reference images - supports multiple for edit/multi-reference models
  referenceImageUrl: z.string().optional(),
  referenceImageUrls: z.array(z.string()).optional(),
  referenceImageId: z.string().optional(),
  // Upscale specific
  upscaleFactor: z.enum(["1", "2", "4", "8"]).optional(),
  // Resolution options
  resolution: z.enum(["1K", "2K", "4K"]).optional(),
  // Seedream specific
  imageSize: z.enum([
    "square", "square_hd", "portrait_4_3", "portrait_3_2", "portrait_16_9",
    "landscape_4_3", "landscape_3_2", "landscape_16_9", "landscape_21_9"
  ]).optional(),
  maxImages: z.number().min(1).max(6).optional(),
  seed: z.number().optional(),
  // Flux specific
  steps: z.number().min(1).max(50).optional(),
  guidance: z.number().min(1).max(20).optional(),
  imageAnalysis: z.object({
    productName: z.string().optional().nullable(),
    productType: z.string().optional().nullable(),
    colors: z.array(z.string()).optional(),
    mood: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    suggestedStyle: z.string().optional().nullable(),
  }).optional(),
})

// Helper function to save generated image locally and to database
async function saveGeneratedImageLocally(
  userId: string,
  imageUrl: string,
  options: {
    prompt?: string
    model?: string
    provider?: string
    presetId?: string
    aspectRatio?: string
    title?: string
  }
): Promise<{
  localUrl: string
  thumbnailUrl: string
  projectId: string
}> {
  // Fetch the image from external URL
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error("Bild konnte nicht von externer URL geladen werden")
  }

  const contentType = imageResponse.headers.get("content-type") || "image/png"
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

  // Determine file extension
  let extension = "png"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    extension = "jpg"
  } else if (contentType.includes("webp")) {
    extension = "webp"
  }

  // Create unique filename
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const filename = `${userId}-gen-${timestamp}-${randomSuffix}.${extension}`
  const thumbnailFilename = `${userId}-gen-${timestamp}-${randomSuffix}-thumb.webp`

  // Ensure upload directories exist
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails")
  
  await mkdir(uploadDir, { recursive: true })
  await mkdir(thumbnailDir, { recursive: true })

  // Save original file
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, imageBuffer)

  // Create thumbnail with Sharp
  const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
  await sharp(imageBuffer)
    .resize(400, 400, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(thumbnailPath)

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata()

  // Create MediaProject entry
  const project = await prisma.mediaProject.create({
    data: {
      userId: userId,
      type: "IMAGE",
      title: options.title || `Generiertes Bild ${new Date().toLocaleDateString('de-DE')}`,
      status: "COMPLETED",
      source: "GENERATED",
      fileUrl: `/api/files/${filename}`,
      thumbnailUrl: `/api/files/thumbnails/${thumbnailFilename}`,
      aspectRatio: options.aspectRatio || "1:1",
      prompt: options.prompt || undefined,
      model: options.model || undefined,
      provider: options.provider?.toUpperCase() || undefined,
      presetId: options.presetId || undefined,
      metadata: JSON.stringify({
        originalUrl: imageUrl,
        mimeType: contentType,
        size: imageBuffer.length,
        width: metadata.width,
        height: metadata.height,
        savedAt: new Date().toISOString(),
      }),
    },
  })

  return {
    localUrl: `/api/files/${filename}`,
    thumbnailUrl: `/api/files/thumbnails/${thumbnailFilename}`,
    projectId: project.id,
  }
}

// KIE.AI Universal API Configuration
// Based on official KIE.ai API documentation from docs folder
// ALL requests go through: POST https://api.kie.ai/api/v1/jobs/createTask
// Status check: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}
const KIE_API_BASE = "https://api.kie.ai/api/v1"
const KIE_CREATE_TASK_ENDPOINT = `${KIE_API_BASE}/jobs/createTask`
const KIE_STATUS_ENDPOINT = `${KIE_API_BASE}/jobs/recordInfo`

// Model configurations with their exact model IDs as per official docs
const KIE_AI_MODELS = {
  // ===== NANO BANANA PRO (Gemini 3 Pro Image) =====
  // Docs: https://kie.ai/nano-banana-pro
  // Model ID: "nano-banana-pro"
  "nano-banana-pro": {
    modelId: "nano-banana-pro",
    type: "text-to-image",
    supportsImageInput: true,
    maxImages: 8,
    supportedAspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "auto"],
    supportedResolutions: ["1K", "2K", "4K"],
    priceCredits: { "1K": 18, "2K": 18, "4K": 24 },
  },
  
  // ===== NANO BANANA (Gemini 2.5 Flash Image) =====
  // Docs: https://kie.ai/nano-banana
  // Model ID: "google/nano-banana"
  "nano-banana": {
    modelId: "google/nano-banana",
    type: "text-to-image",
    supportsImageInput: false, // nano-banana is text-only per docs
    supportedImageSizes: ["1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9", "auto"],
    priceCredits: 4,
  },
  
  // ===== NANO BANANA EDIT (Gemini 2.5 Flash Image - Editing) =====
  // Docs: https://kie.ai/model/google/nano-banana-edit.md
  // Model ID: "google/nano-banana-edit"
  "nano-banana-edit": {
    modelId: "google/nano-banana-edit",
    type: "image-to-image",
    supportsImageInput: true,
    requiresImageInput: true,
    maxImages: 10,
    supportedImageSizes: ["1:1", "9:16", "16:9", "3:4", "4:3", "3:2", "2:3", "5:4", "4:5", "21:9", "auto"],
    priceCredits: 4,
  },
  
  // ===== FLUX 2 PRO - Text to Image =====
  // Docs: https://kie.ai/flux-2
  // Model ID: "flux-2/pro-text-to-image"
  "flux-2-pro-text": {
    modelId: "flux-2/pro-text-to-image",
    type: "text-to-image",
    supportsImageInput: false,
    supportedAspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "auto"],
    supportedResolutions: ["1K", "2K"],
    priceCredits: 5,
  },
  
  // ===== FLUX 2 PRO - Image to Image =====
  // Docs: https://kie.ai/flux-2
  // Model ID: "flux-2/pro-image-to-image"
  "flux-2-pro-img": {
    modelId: "flux-2/pro-image-to-image",
    type: "image-to-image",
    supportsImageInput: true,
    requiresImageInput: true,
    maxImages: 8,
    supportedAspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "auto"],
    supportedResolutions: ["1K", "2K"],
    priceCredits: 5,
  },
  
  // ===== FLUX 2 FLEX - Text to Image (Budget) =====
  // Model ID: "flux-2/flex-text-to-image"
  "flux-2-flex-text": {
    modelId: "flux-2/flex-text-to-image",
    type: "text-to-image",
    supportsImageInput: false,
    supportedAspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "auto"],
    supportedResolutions: ["1K", "2K"],
    priceCredits: 14,
  },
  
  // ===== FLUX 2 FLEX - Image to Image (Budget) =====
  // Model ID: "flux-2/flex-image-to-image"
  "flux-2-flex-img": {
    modelId: "flux-2/flex-image-to-image",
    type: "image-to-image",
    supportsImageInput: true,
    requiresImageInput: true,
    maxImages: 8,
    supportedAspectRatios: ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "auto"],
    supportedResolutions: ["1K", "2K"],
    priceCredits: 14,
  },
  
  // ===== SEEDREAM V4 - Text to Image =====
  // Docs: https://kie.ai/seedream-api
  // Model ID: "bytedance/seedream-v4-text-to-image"
  "seedream-v4-text": {
    modelId: "bytedance/seedream-v4-text-to-image",
    type: "text-to-image",
    supportsImageInput: false,
    supportedImageSizes: ["square", "square_hd", "portrait_4_3", "portrait_3_2", "portrait_16_9", "landscape_4_3", "landscape_3_2", "landscape_16_9", "landscape_21_9"],
    supportedResolutions: ["1K", "2K", "4K"],
    maxOutputImages: 6,
    priceCredits: 3.5,
  },
  
  // ===== SEEDREAM V4 - Edit (Image to Image) =====
  // Model ID: "bytedance/seedream-v4-edit"
  "seedream-v4-edit": {
    modelId: "bytedance/seedream-v4-edit",
    type: "image-to-image",
    supportsImageInput: true,
    requiresImageInput: true,
    maxImages: 10,
    supportedImageSizes: ["square", "square_hd", "portrait_4_3", "portrait_3_2", "portrait_16_9", "landscape_4_3", "landscape_3_2", "landscape_16_9", "landscape_21_9"],
    supportedResolutions: ["1K", "2K", "4K"],
    priceCredits: 3.5,
  },
  
  // ===== TOPAZ IMAGE UPSCALE =====
  // Docs: https://kie.ai/topaz-image-upscale
  // Model ID: "topaz/image-upscale"
  "topaz-image-upscale": {
    modelId: "topaz/image-upscale",
    type: "upscale",
    supportsImageInput: true,
    requiresImageInput: true,
    maxImages: 1,
    supportedUpscaleFactors: ["1", "2", "4", "8"],
    priceCredits: { "1": 10, "2": 10, "4": 20, "8": 40 },
  },
} as const

type KieModelKey = keyof typeof KIE_AI_MODELS

// Gemini aspect ratio mapping - all supported ratios per official docs
const GEMINI_ASPECT_RATIOS: Record<string, string> = {
  "1:1": "1:1",
  "2:3": "2:3",
  "3:2": "3:2",
  "3:4": "3:4",
  "4:3": "4:3",
  "4:5": "4:5",
  "5:4": "5:4",
  "9:16": "9:16",
  "16:9": "16:9",
  "21:9": "21:9",
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = imageSchema.parse(body)

    // Get user with systemPrompt
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true },
    })

    // Build enhanced prompt with preset and system prompt
    let enhancedPrompt = data.prompt
    let styleUsed = data.style

    // Apply preset template if selected
    if (data.presetId) {
      const preset = await prisma.aiPreset.findUnique({
        where: { id: data.presetId },
      })
      
      if (preset && preset.promptTemplate) {
        // Replace placeholders with analysis data if available
        let filledTemplate = preset.promptTemplate
        if (data.imageAnalysis) {
          if (data.imageAnalysis.productName) {
            filledTemplate = filledTemplate.replace(/\[PRODUKTNAME\]/g, data.imageAnalysis.productName)
          }
          if (data.imageAnalysis.colors && data.imageAnalysis.colors.length > 0) {
            filledTemplate = filledTemplate.replace(/\[MARKENFARBE\]/g, data.imageAnalysis.colors[0])
            filledTemplate = filledTemplate.replace(/\[HEX-FARBEN\]/g, data.imageAnalysis.colors.join(', '))
          }
          if (data.imageAnalysis.mood) {
            filledTemplate = filledTemplate.replace(/\[STIMMUNG\]/g, data.imageAnalysis.mood)
          }
        }
        enhancedPrompt = filledTemplate
        styleUsed = preset.name
      }
    }

    // Add user's brand context (shortened) for brand consistency
    // Only include essential brand info to not overwhelm the image prompt
    if (user?.systemPrompt) {
      // Extract only the most essential brand info (brand name, style, colors)
      const brandLines = user.systemPrompt.split('\n')
      const essentialInfo: string[] = []
      
      // Look for brand name
      const brandNameMatch = user.systemPrompt.match(/(?:Marke|Brand)[:\s]+[„"']?([^„"'\n]+)[„"']?/i)
      if (brandNameMatch) {
        essentialInfo.push(`Brand: ${brandNameMatch[1].trim()}`)
      }
      
      // Look for brand style keywords
      const styleMatch = user.systemPrompt.match(/(?:Markenstil|Style)[:\s]+([^\n]+)/i)
      if (styleMatch) {
        // Keep only first 5 style words
        const styleWords = styleMatch[1].split(/[,.]/).slice(0, 5).map(s => s.trim()).filter(Boolean)
        if (styleWords.length > 0) {
          essentialInfo.push(`Style: ${styleWords.join(', ')}`)
        }
      }
      
      // Only add brand context if we extracted something meaningful
      if (essentialInfo.length > 0) {
        enhancedPrompt = `[${essentialInfo.join(' | ')}]\n\n${enhancedPrompt}`
      }
    }

    let imageUrl: string
    const usedProvider = data.provider
    const usedModel = data.model

    if (data.provider === "gemini") {
      // Use Gemini API for image generation
      imageUrl = await generateWithGemini(session.user.id, enhancedPrompt, data)
    } else {
      // Use KIE.ai API for image generation
      imageUrl = await generateWithKieAi(session.user.id, enhancedPrompt, data)
    }

    // Get preset name for title
    let presetName: string | undefined
    if (data.presetId) {
      const preset = await prisma.aiPreset.findUnique({
        where: { id: data.presetId },
        select: { name: true },
      })
      presetName = preset?.name
    }

    // Auto-save generated image locally and to database
    // This ensures images are persistent and accessible from any device
    const savedImage = await saveGeneratedImageLocally(
      session.user.id,
      imageUrl,
      {
        prompt: data.prompt,
        model: usedModel,
        provider: usedProvider,
        presetId: data.presetId,
        aspectRatio: data.aspectRatio,
        title: presetName 
          ? `${presetName} - ${new Date().toLocaleDateString('de-DE')}`
          : undefined,
      }
    )

    // If projectId is provided, also update that project
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
            fileUrl: savedImage.localUrl,
            thumbnailUrl: savedImage.thumbnailUrl,
            prompt: data.prompt,
            style: styleUsed,
            aspectRatio: data.aspectRatio,
            model: usedModel,
            provider: usedProvider.toUpperCase(),
            updatedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({ 
      imageUrl: savedImage.localUrl,
      thumbnailUrl: savedImage.thumbnailUrl,
      projectId: savedImage.projectId,
      prompt: data.prompt,
      enhancedPrompt: enhancedPrompt !== data.prompt ? enhancedPrompt : undefined,
      style: styleUsed,
      aspectRatio: data.aspectRatio,
      provider: usedProvider,
      model: usedModel,
      referenceImageUsed: !!data.referenceImageUrl,
      autoSaved: true, // Indicates image was automatically saved to gallery
    })
  } catch (error) {
    console.error("Error generating image:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Fehler bei der Bildgenerierung" }, { status: 500 })
  }
}

async function generateWithGemini(
  userId: string, 
  prompt: string, 
  data: z.infer<typeof imageSchema>
): Promise<string> {
  // Get Gemini API key
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      provider: "GEMINI",
      isActive: true,
    },
  })

  if (!apiKey) {
    throw new Error("Kein aktiver Gemini API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu.")
  }

  // Decrypt the API key (it's stored as base64)
  const { decryptApiKey } = await import("@/lib/utils")
  const geminiKey = decryptApiKey(apiKey.keyEncrypted)
  
  // Debug: Log key info (first/last 4 chars only for security)
  console.log("API Key Debug:", {
    encryptedLength: apiKey.keyEncrypted.length,
    decryptedLength: geminiKey.length,
    decryptedStart: geminiKey.substring(0, 4),
    decryptedEnd: geminiKey.substring(geminiKey.length - 4),
    startsWithAI: geminiKey.startsWith("AI"),
  })

  // Determine which Gemini model to use for image generation
  // Official models from https://ai.google.dev/gemini-api/docs/image-generation:
  // - gemini-2.5-flash-image (Nano Banana) - fast & efficient, stable
  // - gemini-3-pro-image-preview (Nano Banana Pro) - advanced, supports 4K, thinking mode (preview, may timeout)
  // Default to gemini-2.5-flash-image for reliability
  const model = data.model === "gemini-3-pro-image-preview" 
    ? "gemini-3-pro-image-preview" 
    : "gemini-2.5-flash-image"

  console.log("Using Gemini Image Model:", model)

  // Get aspect ratio - Gemini supports: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9
  const aspectRatio = GEMINI_ASPECT_RATIOS[data.aspectRatio] || "1:1"

  // Build the request for Gemini image generation
  // According to official REST API docs (https://ai.google.dev/api/generate-content#ImageConfig):
  // - imageConfig is a field within generationConfig (camelCase)
  // - Fields: aspectRatio (string), imageSize (string: "1K", "2K", "4K")
  // 
  // IMPORTANT: The prompt must explicitly request image generation to ensure
  // the model returns an image and not just text description.
  // Prefix the prompt with a clear instruction to generate an image.
  const imageGenerationPrefix = "Generate an image based on the following description. Output the generated image:\n\n"
  const fullPrompt = aspectRatio !== "1:1" 
    ? `${imageGenerationPrefix}${prompt}\n\n[Aspect ratio: ${aspectRatio}]` 
    : `${imageGenerationPrefix}${prompt}`
    
  const requestBody: Record<string, unknown> = {
    contents: [
      {
        parts: [
          { text: fullPrompt }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  }

  // Add reference image if provided
  if (data.referenceImageUrl) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const absoluteUrl = data.referenceImageUrl.startsWith('/')
        ? `${baseUrl}${data.referenceImageUrl}`
        : data.referenceImageUrl
      
      const imageResponse = await fetch(absoluteUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      // Add image to the request
      const contents = requestBody.contents as Array<{ parts: Array<Record<string, unknown>> }>
      contents[0].parts.unshift({
        inline_data: {
          mime_type: mimeType,
          data: base64Image,
        }
      })
    } catch (error) {
      console.error("Error fetching reference image:", error)
    }
  }

  console.log("Gemini Request Body:", JSON.stringify(requestBody, null, 2))

  // Set timeout - gemini-2.5-flash-image is faster (~10s), gemini-3-pro-image-preview can take longer
  const timeoutMs = model === "gemini-3-pro-image-preview" ? 120000 : 60000 // 2min for Pro, 1min for Flash
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Gemini API Error:", errorData)
      
      // If the current model fails, provide helpful error message
      if (model === "gemini-3-pro-image-preview") {
        throw new Error(`Gemini Pro Image Preview Fehler: ${errorData.error?.message || "Unbekannter Fehler"}. Versuchen Sie es mit dem schnelleren Gemini 2.5 Flash Modell.`)
      }
      throw new Error(errorData.error?.message || "Fehler bei der Gemini Bildgenerierung")
    }

    const responseData = await response.json()
  
    // Debug: Log full response structure
    console.log("Gemini Full Response:", JSON.stringify(responseData, null, 2))
  
    // Extract image from response
    const parts = responseData.candidates?.[0]?.content?.parts || []
    console.log("Response Parts:", JSON.stringify(parts, null, 2))
  
    for (const part of parts) {
      if (part.inlineData?.data) {
        // Convert base64 to data URL (camelCase as per JS SDK)
        const mimeType = part.inlineData.mimeType || 'image/png'
        console.log("Found image data, mimeType:", mimeType, "length:", part.inlineData.data.length)
        return `data:${mimeType};base64,${part.inlineData.data}`
      }
      // Also check snake_case format (REST API)
      if (part.inline_data?.data) {
        const mimeType = part.inline_data.mime_type || 'image/png'
        console.log("Found image data (snake_case), mimeType:", mimeType, "length:", part.inline_data.data.length)
        return `data:${mimeType};base64,${part.inline_data.data}`
      }
    }

    throw new Error("Keine Bild-Daten in der Gemini-Antwort gefunden")
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      if (model === "gemini-3-pro-image-preview") {
        throw new Error("Gemini Pro Image Preview Timeout. Das Modell ist möglicherweise überlastet. Bitte versuchen Sie es mit dem schnelleren Gemini 2.5 Flash Modell.")
      }
      throw new Error("Bildgenerierung Timeout. Bitte versuchen Sie es erneut.")
    }
    throw error
  }
}

async function generateWithKieAi(
  userId: string, 
  prompt: string, 
  data: z.infer<typeof imageSchema>
): Promise<string> {
  // Get KIE.ai API key
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      provider: "KIE",
      isActive: true,
    },
  })

  if (!apiKey) {
    throw new Error("Kein aktiver KIE.ai API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu.")
  }

  // Decrypt the API key
  const { decryptApiKey } = await import("@/lib/utils")
  const kieKey = decryptApiKey(apiKey.keyEncrypted)
  
  // Get model configuration - default to nano-banana-pro if model not found
  let modelKey = data.model as KieModelKey
  let modelConfig = KIE_AI_MODELS[modelKey]
  
  if (!modelConfig) {
    // Fallback to nano-banana-pro for unknown models
    console.warn(`Unknown model ${data.model}, falling back to nano-banana-pro`)
    modelKey = "nano-banana-pro"
    modelConfig = KIE_AI_MODELS[modelKey]
  }

  // Prepare reference image URLs
  const imageUrls: string[] = []
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  if (data.referenceImageUrls && data.referenceImageUrls.length > 0) {
    for (const url of data.referenceImageUrls) {
      const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : url
      imageUrls.push(absoluteUrl)
    }
  } else if (data.referenceImageUrl) {
    const absoluteUrl = data.referenceImageUrl.startsWith('/') 
      ? `${baseUrl}${data.referenceImageUrl}` 
      : data.referenceImageUrl
    imageUrls.push(absoluteUrl)
  }

  // Build request body based on model type
  let requestBody: Record<string, unknown> = {}
  
  switch (modelKey) {
    // ===== NANO BANANA PRO (Gemini 3 Pro Image) =====
    case "nano-banana-pro": {
      requestBody = {
        prompt,
        aspect_ratio: data.aspectRatio || "1:1",
        resolution: data.resolution || "1K",
        output_format: "png",
      }
      // Add reference images if provided (up to 8)
      if (imageUrls.length > 0) {
        requestBody.image_input = imageUrls.slice(0, 8)
      }
      break
    }
    
    // ===== NANO BANANA (Gemini 2.5 Flash Image) =====
    case "nano-banana": {
      requestBody = {
        prompt,
        output_format: "png",
        image_size: data.aspectRatio || "1:1", // nano-banana uses image_size for aspect
      }
      break
    }
    
    // ===== NANO BANANA EDIT (Gemini 2.5 Flash Image - Editing) =====
    case "nano-banana-edit": {
      if (imageUrls.length === 0) {
        throw new Error("Nano Banana Edit erfordert ein Referenzbild")
      }
      requestBody = {
        prompt,
        image_urls: imageUrls.slice(0, 10), // Up to 10 images
        output_format: "png",
        image_size: data.aspectRatio || "1:1",
      }
      break
    }
    
    // ===== FLUX 2 PRO - Text to Image =====
    case "flux-2-pro-text": {
      requestBody = {
        prompt,
        aspect_ratio: data.aspectRatio || "1:1",
        resolution: data.resolution || "1K",
      }
      break
    }
    
    // ===== FLUX 2 PRO - Image to Image =====
    case "flux-2-pro-img": {
      if (imageUrls.length === 0) {
        throw new Error("Flux 2 Pro Image-to-Image erfordert ein Referenzbild")
      }
      requestBody = {
        prompt,
        input_urls: imageUrls.slice(0, 8), // Supports up to 8 reference images
        aspect_ratio: data.aspectRatio || "1:1",
        resolution: data.resolution || "1K",
      }
      break
    }
    
    // ===== FLUX 2 FLEX - Text to Image (Budget) =====
    case "flux-2-flex-text": {
      requestBody = {
        prompt,
        aspect_ratio: data.aspectRatio || "1:1",
        resolution: data.resolution || "1K",
      }
      break
    }
    
    // ===== FLUX 2 FLEX - Image to Image (Budget) =====
    case "flux-2-flex-img": {
      if (imageUrls.length === 0) {
        throw new Error("Flux 2 Flex Image-to-Image erfordert ein Referenzbild")
      }
      requestBody = {
        prompt,
        input_urls: imageUrls.slice(0, 8), // Supports up to 8 reference images
        aspect_ratio: data.aspectRatio || "1:1",
        resolution: data.resolution || "1K",
      }
      break
    }
    
    // ===== SEEDREAM V4 - Text to Image =====
    case "seedream-v4-text": {
      // Map aspectRatio to Seedream image_size format
      let imageSize = "square"
      switch (data.aspectRatio) {
        case "1:1": imageSize = data.resolution === "4K" ? "square_hd" : "square"; break
        case "4:3": imageSize = "landscape_4_3"; break
        case "3:2": imageSize = "landscape_3_2"; break
        case "16:9": imageSize = "landscape_16_9"; break
        case "21:9": imageSize = "landscape_21_9"; break
        case "3:4": imageSize = "portrait_4_3"; break
        case "2:3": imageSize = "portrait_3_2"; break
        case "9:16": imageSize = "portrait_16_9"; break
        default: imageSize = "square"
      }
      requestBody = {
        prompt,
        image_size: data.imageSize || imageSize,
        image_resolution: data.resolution || "1K",
        max_images: data.maxImages || 1,
      }
      if (data.seed) {
        requestBody.seed = data.seed
      }
      break
    }
    
    // ===== SEEDREAM V4 - Edit (Image to Image) =====
    case "seedream-v4-edit": {
      if (imageUrls.length === 0) {
        throw new Error("Seedream V4 Edit erfordert ein Referenzbild")
      }
      // Map aspectRatio to Seedream image_size format
      let imageSize = "square"
      switch (data.aspectRatio) {
        case "1:1": imageSize = data.resolution === "4K" ? "square_hd" : "square"; break
        case "4:3": imageSize = "landscape_4_3"; break
        case "3:2": imageSize = "landscape_3_2"; break
        case "16:9": imageSize = "landscape_16_9"; break
        case "21:9": imageSize = "landscape_21_9"; break
        case "3:4": imageSize = "portrait_4_3"; break
        case "2:3": imageSize = "portrait_3_2"; break
        case "9:16": imageSize = "portrait_16_9"; break
        default: imageSize = "square"
      }
      requestBody = {
        prompt,
        image_urls: imageUrls.slice(0, 10), // Up to 10 images per docs
        image_size: data.imageSize || imageSize,
        image_resolution: data.resolution || "1K",
      }
      if (data.seed) {
        requestBody.seed = data.seed
      }
      break
    }
    
    // ===== TOPAZ IMAGE UPSCALE =====
    case "topaz-image-upscale": {
      if (imageUrls.length === 0) {
        throw new Error("Topaz Upscale erfordert ein Bild zum Hochskalieren")
      }
      requestBody = {
        image_url: imageUrls[0],
        upscale_factor: data.upscaleFactor || "2", // Must be string: "1", "2", "4", "8"
      }
      break
    }
    
    default:
      throw new Error(`Modell ${modelKey} nicht implementiert`)
  }

  // =====================================================================
  // UNIVERSAL KIE.AI API REQUEST
  // All models use the same endpoint: POST /api/v1/jobs/createTask
  // Request format: { model: "model-id", input: { ...parameters } }
  // =====================================================================
  const universalRequestBody = {
    model: modelConfig.modelId,
    input: requestBody,
  }

  console.log(`KIE.AI Request to ${KIE_CREATE_TASK_ENDPOINT}:`, JSON.stringify(universalRequestBody, null, 2))

  const kieResponse = await fetch(KIE_CREATE_TASK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${kieKey}`,
    },
    body: JSON.stringify(universalRequestBody),
  })

  if (!kieResponse.ok) {
    const errorData = await kieResponse.json().catch(() => ({}))
    console.error("KIE.ai API Error:", errorData)
    
    // Provide specific error messages
    const errorMessage = errorData.error?.message || errorData.message || errorData.msg || "Unbekannter Fehler"
    throw new Error(`KIE.AI Fehler (${modelKey}): ${errorMessage}`)
  }

  const kieData = await kieResponse.json()
  console.log("KIE.AI Response:", JSON.stringify(kieData, null, 2))
  
  // Check if response indicates success
  if (kieData.code !== 200) {
    throw new Error(`KIE.AI Fehler: ${kieData.msg || "Unbekannter Fehler"}`)
  }
  
  // All KIE.AI models are async - poll for result using taskId
  if (kieData.data?.taskId) {
    const taskId = kieData.data.taskId
    console.log(`KIE.AI Task created: ${taskId}, polling for result...`)
    
    return await pollKieAiTask(kieKey, taskId, modelKey)
  }
  
  // Fallback: try to extract image URL directly from response (rare)
  return extractImageUrl(kieData)
}

// Poll for KIE.AI async task completion using universal status endpoint
// Status endpoint: GET /api/v1/jobs/recordInfo?taskId={taskId}
// Response states: "waiting" = in progress, "success" = done, "fail" = error
// Result in: data.resultJson = { resultUrls: [...] }
async function pollKieAiTask(
  apiKey: string,
  taskId: string,
  modelKey: string,
  maxWaitMs: number = 120000, // 2 minutes max
  pollIntervalMs: number = 3000 // Poll every 3 seconds
): Promise<string> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitMs) {
    // Wait before polling
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
    
    const statusUrl = `${KIE_STATUS_ENDPOINT}?taskId=${taskId}`
    console.log(`KIE.AI Checking status: ${statusUrl}`)
    
    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    })
    
    if (!statusResponse.ok) {
      console.error("KIE.AI Status check failed:", statusResponse.status)
      continue
    }
    
    const statusData = await statusResponse.json()
    console.log("KIE.AI Status:", JSON.stringify(statusData, null, 2))
    
    if (statusData.code !== 200) {
      throw new Error(`KIE.AI Status Error: ${statusData.msg || "Unbekannter Fehler"}`)
    }
    
    const taskData = statusData.data
    
    // Check state: "waiting", "success", "fail"
    switch (taskData.state) {
      case "waiting":
        // Still generating
        const progress = taskData.progress ? `${(parseFloat(taskData.progress) * 100).toFixed(0)}%` : "..."
        console.log(`KIE.AI Task ${taskId} generating: ${progress}`)
        continue
        
      case "success":
        // Success! Extract result from resultJson
        console.log(`KIE.AI Task ${taskId} completed successfully`)
        
        // Parse resultJson which contains resultUrls array
        if (taskData.resultJson) {
          let resultJson = taskData.resultJson
          // Parse if it's a string
          if (typeof resultJson === 'string') {
            try {
              resultJson = JSON.parse(resultJson)
            } catch {
              console.error("Failed to parse resultJson:", resultJson)
            }
          }
          
          if (resultJson.resultUrls && Array.isArray(resultJson.resultUrls) && resultJson.resultUrls.length > 0) {
            return resultJson.resultUrls[0]
          }
        }
        
        // Fallback to extractImageUrl
        return extractImageUrl(taskData)
        
      case "fail":
        const failMessage = taskData.failMsg || taskData.errorMessage || taskData.errMsg || "Unbekannter Fehler"
        throw new Error(`KIE.AI Generation failed: ${failMessage}`)
        
      default:
        // Also check legacy successFlag for backward compatibility
        if (taskData.successFlag !== undefined) {
          switch (taskData.successFlag) {
            case 0: continue // Still generating
            case 1: return extractImageUrl(taskData) // Success
            case 2: throw new Error(`KIE.AI Task creation failed: ${taskData.errorMessage || "Unbekannter Fehler"}`)
            case 3: throw new Error(`KIE.AI Generation failed: ${taskData.errorMessage || "Unbekannter Fehler"}`)
          }
        }
        console.log(`Unknown state: ${taskData.state}`)
        continue
    }
  }
  
  throw new Error(`KIE.AI Task ${taskId} timed out after ${maxWaitMs / 1000} seconds`)
}

// Extract image URL from various response formats
function extractImageUrl(data: Record<string, unknown>): string {
  let imageUrl: string | undefined
  
  // Handle nested response structure
  const responseData = (data.response as Record<string, unknown>) || data
  
  // Try various response formats
  if (responseData.resultImageUrl) {
    imageUrl = responseData.resultImageUrl as string
  } else if (responseData.result_urls && Array.isArray(responseData.result_urls) && responseData.result_urls.length > 0) {
    imageUrl = responseData.result_urls[0] as string
  } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const img = data.images[0] as { url?: string } | string
    imageUrl = typeof img === 'string' ? img : img.url
  } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    const img = data.data[0] as { url?: string } | string
    imageUrl = typeof img === 'string' ? img : img.url
  } else if (data.output_url) {
    imageUrl = data.output_url as string
  } else if ((data.result as Record<string, unknown>)?.url) {
    imageUrl = (data.result as Record<string, unknown>).url as string
  } else if (data.url) {
    imageUrl = data.url as string
  } else if (typeof data === 'string' && (data as string).startsWith('http')) {
    imageUrl = data as string
  }

  if (!imageUrl) {
    console.error("Could not extract image URL from response:", JSON.stringify(data, null, 2))
    throw new Error("Keine Bild-URL in der KIE.AI-Antwort erhalten")
  }

  return imageUrl
}

// ===== GET endpoint to retrieve available models with their aspect ratios =====
// This enables dynamic aspect ratio selection in the frontend based on selected model
export async function GET() {
  // Build models list with their supported aspect ratios/image sizes
  const models = Object.entries(KIE_AI_MODELS).map(([key, config]) => {
    // Get supported aspect ratios - some models use aspectRatios, others use imageSizes
    let supportedAspectRatios: string[] = []
    
    if ('supportedAspectRatios' in config) {
      supportedAspectRatios = config.supportedAspectRatios as unknown as string[]
    } else if ('supportedImageSizes' in config) {
      // For Seedream models - convert image_size to readable format
      const imageSizeToRatio: Record<string, string> = {
        "square": "1:1",
        "square_hd": "1:1 HD",
        "portrait_4_3": "3:4",
        "portrait_3_2": "2:3",
        "portrait_16_9": "9:16",
        "landscape_4_3": "4:3",
        "landscape_3_2": "3:2",
        "landscape_16_9": "16:9",
        "landscape_21_9": "21:9",
      }
      const sizes = config.supportedImageSizes as unknown as string[]
      supportedAspectRatios = sizes.map(s => imageSizeToRatio[s] || s)
    }
    
    // For upscale model, aspect ratio doesn't apply
    if (config.type === "upscale") {
      supportedAspectRatios = ["original"]
    }
    
    return {
      id: key,
      name: getModelDisplayName(key),
      type: config.type,
      supportsImageInput: config.supportsImageInput || false,
      requiresImageInput: ('requiresImageInput' in config && config.requiresImageInput) || false,
      maxImages: ('maxImages' in config ? config.maxImages : 1) as number,
      supportedAspectRatios,
      supportedResolutions: ('supportedResolutions' in config ? config.supportedResolutions : undefined) as string[] | undefined,
      supportedUpscaleFactors: ('supportedUpscaleFactors' in config ? config.supportedUpscaleFactors : undefined) as string[] | undefined,
      priceCredits: config.priceCredits,
    }
  })
  
  return NextResponse.json({ models })
}

// Helper function to get friendly model names
function getModelDisplayName(modelKey: string): string {
  const names: Record<string, string> = {
    "nano-banana-pro": "Nano Banana Pro (Gemini 3 Pro)",
    "nano-banana": "Nano Banana (Gemini 2.5 Flash)",
    "flux-2-pro-text": "Flux 2 Pro (Text zu Bild)",
    "flux-2-pro-img": "Flux 2 Pro (Bild zu Bild)",
    "flux-2-flex-text": "Flux 2 Flex (Text zu Bild - Budget)",
    "flux-2-flex-img": "Flux 2 Flex (Bild zu Bild - Budget)",
    "seedream-v4-text": "Seedream V4 (Text zu Bild)",
    "seedream-v4-edit": "Seedream V4 (Bild bearbeiten)",
    "topaz-image-upscale": "Topaz Upscale (Hochskalieren)",
  }
  return names[modelKey] || modelKey
}

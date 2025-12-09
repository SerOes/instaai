import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Schema for content bundle creation
const contentBundleSchema = z.object({
  // Idea data
  title: z.string().min(1),
  description: z.string().optional(),
  contentType: z.enum(["image", "video", "carousel"]),
  
  // Generation prompts
  imagePrompt: z.string().optional(),
  videoPrompt: z.string().optional(),
  
  // Caption data
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  
  // Configuration
  generateImage: z.boolean().default(true),
  generateVideo: z.boolean().default(false),
  
  // Image generation options - now includes Gemini Direct models and Image-to-Image
  imageModel: z.enum([
    // KIE.AI text-to-image models
    "nano-banana-pro",
    "nano-banana",
    "seedream-4-5-text-to-image",
    "flux-2-pro-text-to-image",
    // KIE.AI image-to-image models
    "seedream-4-5-edit",
    "flux-2-pro-image-to-image",
    // Gemini Direct models
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
  ]).default("nano-banana-pro"),
  imageAspectRatio: z.enum(["1:1", "4:3", "3:4", "4:5", "5:4", "16:9", "9:16", "2:3", "3:2", "21:9"]).default("1:1"),
  // Quality options vary by model: "1K"/"2K"/"4K" for nano-banana-pro/flux, "basic"/"high" for seedream
  imageQuality: z.string().default("2K"),
  
  // Reference image for image-to-image generation
  referenceImageUrl: z.string().url().optional().nullable(),
  
  // Video generation options - includes all KIE.AI models and Gemini Direct
  videoModel: z.enum([
    // KIE.AI Text-to-Video models
    "kling-2-6-text-to-video",
    "veo-3-1-quality",
    "veo-3-1-fast",
    // KIE.AI Image-to-Video models
    "kling-2-6-image-to-video",
    "wan-2-5-image-to-video",
    "sora-2-image-to-video",
    "sora-2-pro-storyboard",
    "seedance-v1-pro-fast",
    "grok-imagine-image-to-video",
    // KIE.AI Veo 3.1 Image-to-Video
    "veo-3-1-quality-i2v",
    "veo-3-1-fast-i2v",
    // Gemini Direct
    "veo-3.1-generate-preview",
    "veo-3.1-i2v-preview",
  ]).default("kling-2-6-text-to-video"),
  videoAspectRatio: z.enum(["1:1", "16:9", "9:16"]).default("9:16"),
  videoDuration: z.enum(["5", "8", "10", "15", "25"]).default("5"),
  videoWithSound: z.boolean().default(false),
  
  // Video reference image for image-to-video models
  videoReferenceImageUrl: z.string().url().optional().nullable(),
  
  // Schedule data
  scheduledAt: z.string().optional(), // ISO date string
  instagramAccountId: z.string().optional(),
  postType: z.enum(["FEED", "REEL", "STORY", "CAROUSEL"]).default("FEED"),
})

// KIE.AI API Configuration
const KIE_API_BASE = "https://api.kie.ai/api/v1"
const KIE_CREATE_TASK = `${KIE_API_BASE}/jobs/createTask`
const KIE_STATUS = `${KIE_API_BASE}/jobs/recordInfo`

// Gemini Direct API models
const GEMINI_DIRECT_IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"]
const GEMINI_DIRECT_VIDEO_MODELS = ["veo-3.1-generate-preview", "veo-3.1-i2v-preview"]

// Image model configurations (KIE.AI)
const IMAGE_MODELS = {
  "nano-banana-pro": {
    modelId: "nano-banana-pro",
    provider: "kieai",
    requiresReference: false,
  },
  "nano-banana": {
    modelId: "google/nano-banana",
    provider: "kieai",
    requiresReference: false,
  },
  "seedream-4-5-text-to-image": {
    modelId: "seedream/4.5-text-to-image",
    provider: "kieai",
    requiresReference: false,
  },
  "seedream-4-5-edit": {
    modelId: "seedream/4.5-edit",
    provider: "kieai",
    requiresReference: true,
  },
  "flux-2-pro-text-to-image": {
    modelId: "flux-2/pro-text-to-image",
    provider: "kieai",
    requiresReference: false,
  },
  "flux-2-pro-image-to-image": {
    modelId: "flux-2/pro-image-to-image",
    provider: "kieai",
    requiresReference: true,
  },
  // Gemini Direct models (handled separately)
  "gemini-2.5-flash-image": {
    modelId: "gemini-2.5-flash-image",
    provider: "gemini",
    requiresReference: false,
  },
  "gemini-3-pro-image-preview": {
    modelId: "gemini-3-pro-image-preview",
    provider: "gemini",
    requiresReference: false,
  },
}

// Video model configurations
const VIDEO_MODELS = {
  // Text-to-Video models
  "kling-2-6-text-to-video": {
    modelId: "kling-2.6/text-to-video",
    provider: "kieai",
    requiresImage: false,
    supportsText: true,
  },
  "veo-3-1-quality": {
    modelId: "veo3",
    provider: "kieai",
    endpoint: "veo/generate",
    requiresImage: false,
    supportsText: true,
  },
  "veo-3-1-fast": {
    modelId: "veo3_fast",
    provider: "kieai",
    endpoint: "veo/generate",
    requiresImage: false,
    supportsText: true,
  },
  
  // Image-to-Video models
  "kling-2-6-image-to-video": {
    modelId: "kling-2.6/image-to-video",
    provider: "kieai",
    requiresImage: true,
    supportsText: true,
  },
  "wan-2-5-image-to-video": {
    modelId: "wan/2-5-image-to-video",
    provider: "kieai",
    requiresImage: true,
    supportsText: true,
  },
  "sora-2-image-to-video": {
    modelId: "sora-2-image-to-video",
    provider: "kieai",
    requiresImage: true,
    supportsText: true,
  },
  "sora-2-pro-storyboard": {
    modelId: "sora-2-pro-storyboard",
    provider: "kieai",
    requiresImage: true,
    supportsText: false,
  },
  "seedance-v1-pro-fast": {
    modelId: "bytedance/v1-pro-fast-image-to-video",
    provider: "kieai",
    requiresImage: true,
    supportsText: true,
  },
  "grok-imagine-image-to-video": {
    modelId: "grok-imagine/image-to-video",
    provider: "kieai",
    requiresImage: true,
    supportsText: true,
  },
  
  // Gemini Direct
  "veo-3.1-generate-preview": {
    modelId: "veo-3.1-generate-preview",
    provider: "gemini",
    requiresImage: false,
    supportsText: true,
  },
  "veo-3.1-i2v-preview": {
    modelId: "veo-3.1-i2v-preview",
    provider: "gemini",
    requiresImage: true,
    supportsText: true,
  },
  
  // KIE.AI Veo 3.1 Image-to-Video
  "veo-3-1-quality-i2v": {
    modelId: "veo3",
    provider: "kieai",
    endpoint: "veo/generate",
    requiresImage: true,
    supportsText: true,
    generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
  },
  "veo-3-1-fast-i2v": {
    modelId: "veo3_fast",
    provider: "kieai",
    endpoint: "veo/generate",
    requiresImage: true,
    supportsText: true,
    generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
  },
}

// ============ GEMINI DIRECT IMAGE GENERATION ============
async function generateImageWithGemini(
  apiKey: string,
  model: string,
  prompt: string,
  aspectRatio: string,
  referenceImageUrl?: string | null
): Promise<string> {
  const imageGenerationPrefix = referenceImageUrl 
    ? "Generate a new image based on the reference image and the following description. Output the generated image:\n\n"
    : "Generate an image based on the following description. Output the generated image:\n\n"
  const fullPrompt = aspectRatio !== "1:1" 
    ? `${imageGenerationPrefix}${prompt}\n\n[Aspect ratio: ${aspectRatio}]` 
    : `${imageGenerationPrefix}${prompt}`

  // Build parts array - text always first
  const parts: Array<{text?: string; inlineData?: {mimeType: string; data: string}}> = [{ text: fullPrompt }]

  // If reference image is provided, add it as inline data
  if (referenceImageUrl) {
    // Handle both data URLs and regular URLs
    if (referenceImageUrl.startsWith("data:")) {
      // Extract base64 data from data URL
      const matches = referenceImageUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          }
        })
      }
    } else {
      // Fetch the image and convert to base64
      try {
        const imageResponse = await fetch(referenceImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64 = Buffer.from(imageBuffer).toString("base64")
        const contentType = imageResponse.headers.get("content-type") || "image/png"
        parts.push({
          inlineData: {
            mimeType: contentType,
            data: base64,
          }
        })
      } catch (err) {
        console.error("Error fetching reference image for Gemini:", err)
        // Continue without reference image
      }
    }
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  }

  const timeoutMs = model === "gemini-3-pro-image-preview" ? 120000 : 60000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || "Gemini image generation failed")
    }

    const responseData = await response.json()
    const parts = responseData.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png"
        return `data:${mimeType};base64,${part.inlineData.data}`
      }
      if (part.inline_data?.data) {
        const mimeType = part.inline_data.mime_type || "image/png"
        return `data:${mimeType};base64,${part.inline_data.data}`
      }
    }
    throw new Error("No image data in Gemini response")
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini image generation timeout")
    }
    throw error
  }
}

// ============ KIE.AI IMAGE GENERATION ============
// Start image generation task via KIE.AI
// Uses the universal createTask endpoint for all models
async function startImageGeneration(
  apiKey: string,
  model: keyof typeof IMAGE_MODELS,
  prompt: string,
  aspectRatio: string,
  quality: string,
  referenceImageUrl?: string
) {
  const modelConfig = IMAGE_MODELS[model]
  
  // Build model-specific input parameters
  let inputParams: Record<string, unknown> = {}

  if (model === "nano-banana-pro") {
    // Nano Banana Pro accepts: 1K, 2K, 4K
    inputParams = {
      prompt,
      aspect_ratio: aspectRatio,
      resolution: quality, // Direct pass: "1K", "2K", "4K"
      output_format: "png",
    }
    if (referenceImageUrl) {
      inputParams.image_input = [referenceImageUrl]
    }
  } else if (model === "nano-banana") {
    // Nano Banana has no quality option
    inputParams = {
      prompt,
      output_format: "png",
      image_size: aspectRatio,
    }
    if (referenceImageUrl) {
      inputParams.image_input = [referenceImageUrl]
    }
  } else if (model === "seedream-4-5-text-to-image") {
    // Seedream 4.5 accepts: "basic" (2K) or "high" (4K)
    inputParams = {
      prompt,
      aspect_ratio: aspectRatio,
      quality: quality, // Direct pass: "basic" or "high"
    }
  } else if (model === "seedream-4-5-edit") {
    if (!referenceImageUrl) {
      throw new Error("Seedream 4.5 Edit erfordert ein Referenzbild")
    }
    // Seedream 4.5 Edit accepts: "basic" or "high"
    inputParams = {
      prompt,
      image_urls: [referenceImageUrl],
      aspect_ratio: aspectRatio,
      quality: quality, // Direct pass: "basic" or "high"
    }
  } else if (model === "flux-2-pro-text-to-image") {
    // Flux 2 Text-to-Image accepts: 1K, 2K
    inputParams = {
      prompt,
      aspect_ratio: aspectRatio,
      resolution: quality, // Direct pass: "1K" or "2K"
    }
  } else if (model === "flux-2-pro-image-to-image") {
    if (!referenceImageUrl) {
      throw new Error("Flux 2 Pro Image-to-Image erfordert ein Referenzbild")
    }
    // Flux 2 Image-to-Image
    inputParams = {
      prompt,
      image_url: referenceImageUrl,
      aspect_ratio: aspectRatio,
      resolution: quality, // Direct pass: "1K" or "2K"
    }
  } else {
    inputParams = {
      prompt,
      aspect_ratio: aspectRatio,
    }
  }

  // Wrap in universal createTask format: { model: "model-id", input: {...} }
  const requestBody = {
    model: modelConfig.modelId,
    input: inputParams,
  }

  console.log("KIE.AI Image Request:", { endpoint: KIE_CREATE_TASK, body: requestBody })

  const response = await fetch(KIE_CREATE_TASK, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  console.log("KIE.AI Response:", response.status, responseText)

  if (!response.ok) {
    let errorMsg = "Image generation failed"
    try {
      const error = JSON.parse(responseText)
      errorMsg = error.msg || error.error?.message || error.message || errorMsg
    } catch {
      errorMsg = responseText || errorMsg
    }
    throw new Error(errorMsg)
  }

  const data = JSON.parse(responseText)
  
  // Check for successful task creation
  if (data.code !== 200) {
    throw new Error(data.msg || "KIE.AI Fehler bei Task-Erstellung")
  }
  
  const taskId = data.data?.taskId || data.taskId
  
  if (!taskId) {
    throw new Error("Keine Task-ID in der API-Antwort erhalten")
  }
  
  return taskId
}

// Start video generation task
async function startVideoGeneration(
  apiKey: string,
  model: keyof typeof VIDEO_MODELS,
  prompt: string,
  aspectRatio: string,
  duration: string,
  withSound: boolean,
  imageUrl?: string
) {
  const modelConfig = VIDEO_MODELS[model]
  
  let requestBody: Record<string, unknown>
  let endpoint: string = KIE_CREATE_TASK

  // Veo models use a different endpoint
  if (model === "veo-3-1-quality" || model === "veo-3-1-fast") {
    endpoint = `${KIE_API_BASE}/veo/generate`
    requestBody = {
      prompt,
      model: modelConfig.modelId,
      aspectRatio: aspectRatio,
    }
    if (imageUrl) {
      requestBody.imageUrls = [imageUrl]
      requestBody.generationType = "REFERENCE_2_VIDEO"
    } else {
      requestBody.generationType = "TEXT_2_VIDEO"
    }
  }
  // Veo 3.1 Image-to-Video (KIE.AI)
  else if (model === "veo-3-1-quality-i2v" || model === "veo-3-1-fast-i2v") {
    if (!imageUrl) throw new Error("Veo 3.1 Image-to-Video erfordert ein Referenzbild")
    endpoint = `${KIE_API_BASE}/veo/generate`
    requestBody = {
      prompt,
      model: model === "veo-3-1-quality-i2v" ? "veo3" : "veo3_fast",
      aspectRatio: aspectRatio,
      imageUrls: [imageUrl],
      generationType: "FIRST_AND_LAST_FRAMES_2_VIDEO",
    }
  }
  // Kling 2.6 models
  else if (model === "kling-2-6-text-to-video") {
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        duration,
        aspect_ratio: aspectRatio,
        sound: withSound,
      },
    }
  }
  else if (model === "kling-2-6-image-to-video") {
    if (!imageUrl) throw new Error("Kling Image-to-Video erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        duration,
        image_urls: [imageUrl],
        sound: withSound,
      },
    }
  }
  // Wan 2.5 Image-to-Video
  else if (model === "wan-2-5-image-to-video") {
    if (!imageUrl) throw new Error("Wan 2.5 erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        image_url: imageUrl,
        duration,
        resolution: "1080p",
        enable_prompt_expansion: true,
      },
    }
  }
  // Sora 2 Image-to-Video
  else if (model === "sora-2-image-to-video") {
    if (!imageUrl) throw new Error("Sora 2 erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        image_urls: [imageUrl],
        aspect_ratio: aspectRatio === "16:9" ? "landscape" : "portrait",
        n_frames: duration,
        remove_watermark: true,
      },
    }
  }
  // Sora 2 Pro Storyboard
  else if (model === "sora-2-pro-storyboard") {
    if (!imageUrl) throw new Error("Sora 2 Pro Storyboard erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        image_urls: [imageUrl],
        aspect_ratio: aspectRatio === "16:9" ? "landscape" : "portrait",
        n_frames: duration,
      },
    }
  }
  // Seedance V1 Pro Fast
  else if (model === "seedance-v1-pro-fast") {
    if (!imageUrl) throw new Error("Seedance erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        image_url: imageUrl,
        resolution: "1080p",
        duration,
      },
    }
  }
  // Grok Imagine Image-to-Video
  else if (model === "grok-imagine-image-to-video") {
    if (!imageUrl) throw new Error("Grok Imagine erfordert ein Referenzbild")
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        image_urls: [imageUrl],
        mode: "normal", // fun, normal, spicy
      },
    }
  }
  else {
    // Fallback for any other model
    requestBody = {
      model: modelConfig.modelId,
      input: {
        prompt,
        duration,
      },
    }
    if (imageUrl) {
      (requestBody.input as Record<string, unknown>).image_url = imageUrl
    }
  }

  console.log("Video generation request:", { endpoint, model, body: requestBody })

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  console.log("Video generation response:", response.status, responseText)

  if (!response.ok) {
    let errorMsg = "Video generation failed"
    try {
      const error = JSON.parse(responseText)
      errorMsg = error.msg || error.error?.message || error.message || errorMsg
    } catch {
      errorMsg = responseText || errorMsg
    }
    throw new Error(errorMsg)
  }

  const data = JSON.parse(responseText)
  
  // Check for successful task creation
  if (data.code && data.code !== 200) {
    throw new Error(data.msg || "KIE.AI Fehler bei Video-Task-Erstellung")
  }
  
  const taskId = data.data?.taskId || data.taskId
  
  if (!taskId) {
    throw new Error("Keine Task-ID in der Video-API-Antwort erhalten")
  }
  
  return taskId
}

// Check task status using universal KIE.AI status endpoint
// GET /api/v1/jobs/recordInfo?taskId={taskId}
// Response states: "waiting" = in progress, "success" = done, "fail" = error
async function checkTaskStatus(apiKey: string, taskId: string) {
  const statusUrl = `${KIE_STATUS}?taskId=${taskId}`
  
  console.log("Checking task status:", { taskId, statusUrl })
  
  const response = await fetch(statusUrl, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Status check failed:", response.status, errorText)
    throw new Error("Failed to check task status")
  }

  const data = await response.json()
  console.log("Task status response:", JSON.stringify(data, null, 2))
  
  if (data.code !== 200) {
    throw new Error(data.msg || "Status check failed")
  }
  
  const taskData = data.data
  
  // Parse resultJson if present and is a string
  let resultUrl: string | undefined
  if (taskData.state === "success" && taskData.resultJson) {
    let resultJson = taskData.resultJson
    if (typeof resultJson === 'string') {
      try {
        resultJson = JSON.parse(resultJson)
      } catch {
        console.error("Failed to parse resultJson:", resultJson)
      }
    }
    
    // Extract URL from various formats
    if (resultJson.resultUrls && Array.isArray(resultJson.resultUrls)) {
      resultUrl = resultJson.resultUrls[0]
    } else if (resultJson.resultImageUrl) {
      resultUrl = resultJson.resultImageUrl
    } else if (resultJson.output_url) {
      resultUrl = resultJson.output_url
    }
  }
  
  return {
    state: taskData.state, // "waiting", "success", "fail"
    resultUrl,
    resultJson: typeof taskData.resultJson === 'string' ? taskData.resultJson : JSON.stringify(taskData.resultJson),
    failMsg: taskData.failMsg || taskData.errorMessage || taskData.errMsg,
  }
}

// Generate caption using Gemini
async function generateCaption(
  geminiKey: string,
  systemPrompt: string,
  imagePrompt: string,
  existingCaption?: string
) {
  if (existingCaption) {
    return { caption: existingCaption, hashtags: [] }
  }

  const prompt = `Als Social-Media-Experte, erstelle eine Instagram-Caption basierend auf folgendem Kontext:

MARKEN-KONTEXT:
${systemPrompt}

CONTENT-BESCHREIBUNG:
${imagePrompt}

Erstelle eine emotional ansprechende Caption auf Deutsch mit:
- Passenden Emojis
- Einem klaren Call-to-Action
- Der Tonalität der Marke

Antworte NUR im JSON-Format:
{"caption": "Deine Caption hier...", "hashtags": ["#hashtag1", "#hashtag2"]}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  )

  if (!response.ok) {
    return { caption: "", hashtags: [] }
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return { caption: text, hashtags: [] }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = contentBundleSchema.parse(body)

    // Get user system prompt
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { systemPrompt: true },
    })

    // Get KIE.AI API key
    const kieApiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "KIE",
        isActive: true,
      },
    })

    // Check if we need KIE.AI or Gemini keys based on model selection
    const isGeminiImage = GEMINI_DIRECT_IMAGE_MODELS.includes(data.imageModel)
    const isGeminiVideo = GEMINI_DIRECT_VIDEO_MODELS.includes(data.videoModel)
    const needsKieKey = !isGeminiImage || !isGeminiVideo

    if (needsKieKey && !kieApiKey) {
      return NextResponse.json({
        error: "Kein aktiver KIE.ai API-Schlüssel gefunden. Für KIE.AI Modelle benötigen Sie einen API-Key.",
      }, { status: 400 })
    }

    // Get Gemini API key (for captions and Gemini Direct models)
    const geminiApiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "GEMINI",
        isActive: true,
      },
    })

    if ((isGeminiImage || isGeminiVideo) && !geminiApiKey) {
      return NextResponse.json({
        error: "Kein aktiver Gemini API-Schlüssel gefunden. Für Gemini Direct Modelle benötigen Sie einen API-Key.",
      }, { status: 400 })
    }

    const { decryptApiKey } = await import("@/lib/utils")
    const kieKey = kieApiKey ? decryptApiKey(kieApiKey.keyEncrypted) : null
    const geminiKey = geminiApiKey ? decryptApiKey(geminiApiKey.keyEncrypted) : null

    const results: {
      imageTaskId?: string
      imageUrl?: string // For Gemini Direct (synchronous)
      videoTaskId?: string
      videoUrl?: string // For Gemini Direct (synchronous)
      caption?: string
      hashtags?: string[]
      projectId?: string
      scheduleId?: string
      provider?: string
    } = {}

    // Step 1: Generate Image (if requested)
    if (data.generateImage && data.imagePrompt) {
      try {
        if (isGeminiImage && geminiKey) {
          // Gemini Direct - synchronous generation
          console.log("Using Gemini Direct for image generation:", data.imageModel)
          results.imageUrl = await generateImageWithGemini(
            geminiKey,
            data.imageModel,
            data.imagePrompt,
            data.imageAspectRatio,
            data.referenceImageUrl
          )
          results.provider = "gemini"
        } else if (kieKey) {
          // KIE.AI - asynchronous generation
          console.log("Using KIE.AI for image generation:", data.imageModel)
          results.imageTaskId = await startImageGeneration(
            kieKey,
            data.imageModel as keyof typeof IMAGE_MODELS,
            data.imagePrompt,
            data.imageAspectRatio,
            data.imageQuality,
            data.referenceImageUrl || undefined
          )
          results.provider = "kieai"
        }
      } catch (error) {
        console.error("Image generation error:", error)
        return NextResponse.json({
          error: `Bildgenerierung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        }, { status: 500 })
      }
    }

    // Step 2: Generate Video (if requested)
    if (data.generateVideo && data.videoPrompt) {
      try {
        if (isGeminiVideo && geminiKey) {
          // Gemini Direct Video - would need to implement async polling
          // For now, return info that this is not yet implemented for synchronous
          console.log("Gemini Direct video generation not yet fully implemented")
          // TODO: Implement Gemini Direct video generation
        } else if (kieKey) {
          // KIE.AI video generation - supports all models
          const videoModelConfig = VIDEO_MODELS[data.videoModel as keyof typeof VIDEO_MODELS]
          
          // Check if model requires image and if image is provided
          if (videoModelConfig?.requiresImage && !data.videoReferenceImageUrl) {
            throw new Error(`${data.videoModel} erfordert ein Referenzbild`)
          }
          
          results.videoTaskId = await startVideoGeneration(
            kieKey,
            data.videoModel as keyof typeof VIDEO_MODELS,
            data.videoPrompt,
            data.videoAspectRatio,
            data.videoDuration,
            data.videoWithSound,
            data.videoReferenceImageUrl || undefined
          )
          results.provider = results.provider || "kieai"
        }
      } catch (error) {
        console.error("Video generation error:", error)
        return NextResponse.json({
          error: `Videogenerierung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        }, { status: 500 })
      }
    }

    // Step 3: Generate or use provided caption
    if (geminiKey && user?.systemPrompt) {
      const captionResult = await generateCaption(
        geminiKey,
        user.systemPrompt,
        data.imagePrompt || data.description || data.title,
        data.caption
      )
      results.caption = captionResult.caption || data.caption
      results.hashtags = captionResult.hashtags?.length > 0 
        ? captionResult.hashtags 
        : data.hashtags
    } else {
      results.caption = data.caption
      results.hashtags = data.hashtags
    }

    // Step 4: Create MediaProject in database
    const project = await prisma.mediaProject.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.contentType === "video" ? "VIDEO" : "IMAGE",
        status: "DRAFT",
        source: "GENERATED",
        prompt: data.imagePrompt || data.videoPrompt,
        aspectRatio: data.imageAspectRatio,
        model: data.imageModel,
        provider: "kieai",
        // Store task IDs in metadata for polling
        metadata: JSON.stringify({
          imageTaskId: results.imageTaskId,
          videoTaskId: results.videoTaskId,
          seasonalContent: true,
        }),
      },
    })
    results.projectId = project.id

    // Step 5: Create Caption entry
    if (results.caption) {
      await prisma.caption.create({
        data: {
          projectId: project.id,
          text: results.caption,
          hashtags: JSON.stringify(results.hashtags || []),
          language: "de",
          isSelected: true,
        },
      })
    }

    // Step 6: Create Schedule (if date provided)
    if (data.scheduledAt && data.instagramAccountId) {
      const schedule = await prisma.postSchedule.create({
        data: {
          projectId: project.id,
          instagramAccountId: data.instagramAccountId,
          scheduledAt: new Date(data.scheduledAt),
          status: "PENDING",
          postType: data.postType,
        },
      })
      results.scheduleId = schedule.id
    }

    // For Gemini Direct, update project with generated URL
    if (results.imageUrl) {
      await prisma.mediaProject.update({
        where: { id: project.id },
        data: { 
          fileUrl: results.imageUrl,
          thumbnailUrl: results.imageUrl,
          status: "COMPLETED",
        },
      })
    }

    // Build response based on provider type
    const isAsync = results.imageTaskId || results.videoTaskId
    
    return NextResponse.json({
      success: true,
      ...results,
      message: isAsync 
        ? "Content-Bundle erstellt. Bild/Video wird generiert."
        : "Content erfolgreich generiert!",
      // Only include polling info for async (KIE.AI) generation
      ...(isAsync && {
        polling: {
          imageTaskId: results.imageTaskId,
          imageModel: data.imageModel,
          videoTaskId: results.videoTaskId,
          videoModel: data.videoModel,
          statusEndpoint: "/api/generate/content-bundle",
        },
      }),
    })
  } catch (error) {
    console.error("Error creating content bundle:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Fehler beim Erstellen des Content-Bundles",
    }, { status: 500 })
  }
}

// GET endpoint to check task status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const taskType = searchParams.get("type") || "image" // "image" or "video"

    if (!taskId) {
      return NextResponse.json({ error: "taskId erforderlich" }, { status: 400 })
    }

    // Get KIE API key
    const kieApiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "KIE",
        isActive: true,
      },
    })

    if (!kieApiKey) {
      return NextResponse.json({ error: "Kein API-Schlüssel gefunden" }, { status: 400 })
    }

    const { decryptApiKey } = await import("@/lib/utils")
    const kieKey = decryptApiKey(kieApiKey.keyEncrypted)

    const status = await checkTaskStatus(kieKey, taskId)

    // Get resultUrl from the status response
    const resultUrl = status.resultUrl

    return NextResponse.json({
      taskId,
      type: taskType,
      state: status.state, // "waiting", "success", "fail"
      resultUrl,
      error: status.failMsg,
    })
  } catch (error) {
    console.error("Error checking task status:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Fehler beim Prüfen des Status",
    }, { status: 500 })
  }
}

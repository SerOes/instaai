import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const videoSchema = z.object({
  prompt: z.string().min(10, "Prompt muss mindestens 10 Zeichen haben"),
  imageUrl: z.string().url().optional(),
  style: z.string().optional(),
  presetId: z.string().optional(),
  aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("9:16"),
  duration: z.enum(["3", "5", "10"]).default("5"),
  model: z.enum(["kie-video-standard", "kie-video-premium"]).default("kie-video-standard"),
  projectId: z.string().cuid().optional(),
  motion: z.enum(["subtle", "moderate", "dynamic"]).default("moderate"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const body = await request.json()
    const data = videoSchema.parse(body)

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

    // Build enhanced prompt with preset and system prompt (Veo 3.1 style)
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
      enhancedPrompt = `Brand Guidelines:\n${user.systemPrompt}\n\n${enhancedPrompt}`
    }

    // Motion intensity descriptions for the prompt
    const motionDescriptions = {
      subtle: "with very subtle, gentle movements",
      moderate: "with natural, flowing movements",
      dynamic: "with dynamic, energetic movements",
    }

    // Enhance prompt with motion description
    enhancedPrompt = `${enhancedPrompt} ${motionDescriptions[data.motion]}`

    // Get resolution based on aspect ratio
    const resolutions = {
      "1:1": { width: 1024, height: 1024 },
      "4:5": { width: 1024, height: 1280 },
      "9:16": { width: 768, height: 1365 },
      "16:9": { width: 1365, height: 768 },
    }

    const resolution = resolutions[data.aspectRatio]

    // Call KIE.ai API for video generation
    // Note: This is a placeholder - actual KIE.ai API endpoint and format may vary
    const kiePayload: Record<string, unknown> = {
      prompt: enhancedPrompt,
      model: data.model,
      width: resolution.width,
      height: resolution.height,
      duration: parseInt(data.duration),
      style: styleUsed,
      motion_intensity: data.motion,
    }

    // If an image URL is provided, use image-to-video mode
    if (data.imageUrl) {
      kiePayload.image_url = data.imageUrl
      kiePayload.mode = "image-to-video"
    }

    const kieResponse = await fetch("https://api.kie.ai/v1/videos/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${kieKey}`,
      },
      body: JSON.stringify(kiePayload),
    })

    if (!kieResponse.ok) {
      const errorData = await kieResponse.json().catch(() => ({}))
      console.error("KIE.ai API Error:", errorData)
      return NextResponse.json({ 
        error: "Fehler bei der Videogenerierung. Bitte überprüfen Sie Ihren API-Schlüssel und versuchen Sie es erneut." 
      }, { status: 500 })
    }

    const kieData = await kieResponse.json()
    
    // Video generation is typically async - return job ID for polling
    const jobId = kieData.job_id || kieData.id
    const videoUrl = kieData.video_url || kieData.data?.url

    // If video is ready immediately
    if (videoUrl) {
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
              fileUrl: videoUrl,
              prompt: data.prompt,
              style: styleUsed,
              aspectRatio: data.aspectRatio,
              model: data.model,
              provider: "KIE",
              metadata: JSON.stringify({
                duration: data.duration,
                motion: data.motion,
              }),
              updatedAt: new Date(),
            },
          })
        }
      }

      return NextResponse.json({ 
        status: "completed",
        videoUrl,
        prompt: data.prompt,
        style: styleUsed,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        model: data.model,
        resolution,
      })
    }

    // If video is being processed, return job ID
    if (jobId) {
      return NextResponse.json({ 
        status: "processing",
        jobId,
        message: "Video wird generiert. Bitte warten Sie und überprüfen Sie den Status mit der Job-ID.",
        prompt: data.prompt,
        style: styleUsed,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        model: data.model,
        resolution,
      })
    }

    return NextResponse.json({ 
      error: "Unerwartete Antwort von der KIE.ai API" 
    }, { status: 500 })
  } catch (error) {
    console.error("Error generating video:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Fehler bei der Videogenerierung" }, { status: 500 })
  }
}

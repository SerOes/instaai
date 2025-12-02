import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  KIE_API,
  parseKieResult,
  pollGeminiVideoStatus,
  type KieQueryStatusResponse,
} from "@/lib/video-providers"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    // Get taskId and provider from query params
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const provider = searchParams.get("provider") || "kie"

    if (!taskId) {
      return NextResponse.json({ error: "taskId ist erforderlich" }, { status: 400 })
    }

    // Handle Gemini Direct provider
    if (provider === "gemini") {
      try {
        // Get Gemini API key from database first, fall back to env
        const { decryptApiKey } = await import("@/lib/utils")
        
        const geminiApiKeyRecord = await prisma.apiKey.findFirst({
          where: {
            userId: session.user.id,
            provider: "GEMINI",
            isActive: true,
          },
        })

        const geminiApiKey = geminiApiKeyRecord 
          ? decryptApiKey(geminiApiKeyRecord.keyEncrypted)
          : process.env.GEMINI_API_KEY

        if (!geminiApiKey) {
          return NextResponse.json({
            taskId,
            status: "failed",
            error: "Kein Gemini API-Key gefunden",
            provider: "gemini",
          })
        }

        const result = await pollGeminiVideoStatus(taskId, geminiApiKey)

        if (result.error === "in_progress") {
          return NextResponse.json({
            taskId: result.operationName || taskId,
            status: "processing",
            progress: 50, // Gemini doesn't provide progress, so estimate
            provider: "gemini",
          })
        }

        if (!result.success) {
          return NextResponse.json({
            taskId,
            status: "failed",
            error: result.error || "Unbekannter Fehler",
            provider: "gemini",
          })
        }

        return NextResponse.json({
          taskId,
          status: "completed",
          progress: 100,
          videoUrl: result.videoUrl,
          provider: "gemini",
        })
      } catch (geminiError) {
        console.error("Gemini status error:", geminiError)
        return NextResponse.json({
          taskId,
          status: "failed",
          error: geminiError instanceof Error ? geminiError.message : "Gemini Statusabfrage fehlgeschlagen",
          provider: "gemini",
        })
      }
    }

    // KIE.AI status check (existing logic)

    // Get API key for KIE.ai
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        provider: "KIE",
        isActive: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({
        error: "Kein aktiver KIE.ai API-Schlüssel gefunden.",
      }, { status: 400 })
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/utils")
    const kieKey = decryptApiKey(apiKey.keyEncrypted)

    // Query task status from KIE.ai
    const statusUrl = `${KIE_API.queryStatus}?taskId=${encodeURIComponent(taskId)}`
    
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${kieKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("KIE Status API Error:", response.status, errorText)
      return NextResponse.json({
        error: `Statusabfrage fehlgeschlagen: ${response.status}`,
      }, { status: response.status })
    }

    const data: KieQueryStatusResponse = await response.json()

    if (data.code !== 200) {
      return NextResponse.json({
        error: `KIE API Fehler: ${data.msg}`,
      }, { status: 400 })
    }

    const taskData = data.data

    // Map status to our format
    type TaskStatus = "processing" | "completed" | "failed"
    let status: TaskStatus = "processing"
    let videoUrl: string | undefined
    let errorMessage: string | undefined

    switch (taskData.state) {
      case "waiting":
        status = "processing"
        break
      case "success":
        status = "completed"
        // Parse result to get video URL
        if (taskData.resultJson) {
          const result = parseKieResult(taskData.resultJson)
          videoUrl = result.videoUrls[0]
        }
        break
      case "fail":
        status = "failed"
        errorMessage = taskData.failMsg || "Video-Generierung fehlgeschlagen"
        break
    }

    // Calculate progress estimate based on time elapsed
    let progress = 0
    if (status === "processing" && taskData.createTime) {
      const elapsed = Date.now() - taskData.createTime
      // Assume ~120 seconds for completion
      progress = Math.min(95, Math.round((elapsed / 120000) * 100))
    } else if (status === "completed") {
      progress = 100
    }

    return NextResponse.json({
      taskId: taskData.taskId,
      status,
      progress,
      videoUrl,
      error: errorMessage,
      model: taskData.model,
      costTime: taskData.costTime,
      createTime: taskData.createTime,
      completeTime: taskData.completeTime,
    })

  } catch (error) {
    console.error("Error checking video status:", error)
    return NextResponse.json({ error: "Fehler bei der Statusabfrage" }, { status: 500 })
  }
}

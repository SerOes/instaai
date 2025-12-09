// Video Generation Provider Configuration
// Supports KIE.AI models and Gemini Direct (Veo 3.1)

import { GoogleGenAI } from '@google/genai'

export type VideoProvider = 'kie' | 'gemini'

export interface VideoModel {
  id: string
  name: string
  description: string
  provider: VideoProvider
  modelId: string  // The actual model ID to send to API
  endpoint: string
  features: {
    imageToVideo: boolean
    textToVideo: boolean
    tailImage?: boolean
    storyboard?: boolean
    sound?: boolean
    resolution?: string[]
    durations: number[]
    aspectRatios: string[]
  }
  maxPromptLength: number
  pricing: 'low' | 'medium' | 'high' | 'premium'
}

// KIE.AI API Endpoints
export const KIE_API = {
  createTask: 'https://api.kie.ai/api/v1/jobs/createTask',
  veoGenerate: 'https://api.kie.ai/api/v1/veo/generate',
  queryStatus: 'https://api.kie.ai/api/v1/jobs/recordInfo',
}

// All supported video models
export const VIDEO_MODELS: VideoModel[] = [
  // ============ KIE.AI MODELS ============
  
  // ===== KLING 2.6 (NEWEST) =====
  {
    id: 'kling-2-6-i2v',
    name: 'Kling 2.6 Image-to-Video',
    description: 'Neuestes Kling Modell - Hochwertige I2V mit Sound-Unterstützung',
    provider: 'kie',
    modelId: 'kling-2.6/image-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      sound: true,
      durations: [5, 10],
      aspectRatios: ['9:16', '16:9', '1:1'],
    },
    maxPromptLength: 1000,
    pricing: 'medium',
  },
  {
    id: 'kling-2-6-t2v',
    name: 'Kling 2.6 Text-to-Video',
    description: 'Neuestes Kling Modell - Text-to-Video mit Sound-Unterstützung',
    provider: 'kie',
    modelId: 'kling-2.6/text-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: false,
      textToVideo: true,
      sound: true,
      durations: [5, 10],
      aspectRatios: ['1:1', '16:9', '9:16'],
    },
    maxPromptLength: 1000,
    pricing: 'medium',
  },
  
  // ===== KLING 2.5 =====
  {
    id: 'kling-2-5-turbo',
    name: 'Kling 2.5 Turbo',
    description: 'Schnelle Image-to-Video Generation mit Tail-Image Support',
    provider: 'kie',
    modelId: 'kling/v2-5-turbo-image-to-video-pro',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      tailImage: true,
      durations: [5, 10],
      aspectRatios: ['9:16', '16:9', '1:1'],
    },
    maxPromptLength: 2500,
    pricing: 'medium',
  },
  {
    id: 'seedance-v1-pro',
    name: 'Seedance V1 Pro Fast',
    description: 'ByteDance Modell mit 720p/1080p Optionen',
    provider: 'kie',
    modelId: 'bytedance/v1-pro-fast-image-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      resolution: ['720p', '1080p'],
      durations: [5, 10],
      aspectRatios: ['9:16', '16:9'],
    },
    maxPromptLength: 10000,
    pricing: 'medium',
  },
  {
    id: 'sora-2-i2v',
    name: 'Sora 2 Image-to-Video',
    description: 'OpenAI Sora für hochwertige I2V Generierung',
    provider: 'kie',
    modelId: 'sora-2-image-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      durations: [5, 10],
      aspectRatios: ['9:16', '16:9', '1:1'],
    },
    maxPromptLength: 5000,
    pricing: 'high',
  },
  {
    id: 'sora-2-storyboard',
    name: 'Sora 2 Storyboard',
    description: 'Multi-Frame Storyboard zu Video',
    provider: 'kie',
    modelId: 'sora-2-pro-storyboard',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      storyboard: true,
      durations: [5, 10, 15],
      aspectRatios: ['16:9'],
    },
    maxPromptLength: 5000,
    pricing: 'premium',
  },
  {
    id: 'wan-2-5',
    name: 'Wan 2.5 I2V',
    description: 'Alibaba Wan mit Prompt Expansion',
    provider: 'kie',
    modelId: 'wan/2-5-image-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      durations: [5],
      aspectRatios: ['9:16', '16:9'],
    },
    maxPromptLength: 3000,
    pricing: 'low',
  },
  {
    id: 'grok-i2v',
    name: 'Grok Imagine I2V',
    description: 'xAI Grok mit Fun/Spicy Modes',
    provider: 'kie',
    modelId: 'grok-imagine/image-to-video',
    endpoint: KIE_API.createTask,
    features: {
      imageToVideo: true,
      textToVideo: false,
      durations: [5, 10],
      aspectRatios: ['9:16', '16:9', '1:1'],
    },
    maxPromptLength: 2000,
    pricing: 'medium',
  },

  // ============ VEO MODELS (via KIE.AI) ============
  {
    id: 'veo-3-1-quality',
    name: 'Veo 3.1 Quality',
    description: 'Google Veo 3.1 - Höchste Qualität, Text & Image-to-Video',
    provider: 'kie',
    modelId: 'veo3',
    endpoint: KIE_API.veoGenerate,
    features: {
      imageToVideo: true,
      textToVideo: true,
      durations: [5, 8],
      aspectRatios: ['9:16', '16:9'],
      resolution: ['720p', '1080p'],
    },
    maxPromptLength: 5000,
    pricing: 'premium',
  },
  {
    id: 'veo-3-1-fast',
    name: 'Veo 3.1 Fast',
    description: 'Google Veo 3.1 Fast - Schneller, Reference Images möglich',
    provider: 'kie',
    modelId: 'veo3_fast',
    endpoint: KIE_API.veoGenerate,
    features: {
      imageToVideo: true,
      textToVideo: true,
      durations: [5, 8],
      aspectRatios: ['9:16', '16:9'],
      resolution: ['720p', '1080p'],
    },
    maxPromptLength: 5000,
    pricing: 'high',
  },

  // ============ GEMINI DIRECT MODELS ============
  {
    id: 'gemini-veo-3-1',
    name: 'Gemini Veo 3.1 (Direct)',
    description: 'Direkter Google API Zugang - Höchste Qualität mit Audio',
    provider: 'gemini',
    modelId: 'veo-3.1-generate-preview',
    endpoint: 'direct', // Uses SDK, not HTTP endpoint
    features: {
      imageToVideo: true,
      textToVideo: true,
      durations: [4, 6, 8],
      aspectRatios: ['9:16', '16:9'],
      resolution: ['720p', '1080p'],
    },
    maxPromptLength: 1024,
    pricing: 'premium',
  },
  {
    id: 'gemini-veo-3-1-fast',
    name: 'Gemini Veo 3.1 Fast (Direct)',
    description: 'Direkter Google API Zugang - Schnell mit Audio',
    provider: 'gemini',
    modelId: 'veo-3.1-fast-generate-preview',
    endpoint: 'direct', // Uses SDK, not HTTP endpoint
    features: {
      imageToVideo: true,
      textToVideo: true,
      durations: [4, 6, 8],
      aspectRatios: ['9:16', '16:9'],
      resolution: ['720p', '1080p'],
    },
    maxPromptLength: 1024,
    pricing: 'high',
  },
  {
    id: 'gemini-veo-3',
    name: 'Gemini Veo 3 (Direct)',
    description: 'Stabiles Veo 3 Modell mit Audio',
    provider: 'gemini',
    modelId: 'veo-3.0-generate-001',
    endpoint: 'direct',
    features: {
      imageToVideo: true,
      textToVideo: true,
      durations: [8],
      aspectRatios: ['9:16', '16:9'],
      resolution: ['720p', '1080p'],
    },
    maxPromptLength: 1024,
    pricing: 'high',
  },
]

// Get model by ID
export function getVideoModel(modelId: string): VideoModel | undefined {
  return VIDEO_MODELS.find(m => m.id === modelId)
}

// Get models by provider
export function getModelsByProvider(provider: VideoProvider): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.provider === provider)
}

// Build payload for KIE.AI standard models
export interface KieStandardPayload {
  model: string
  input: {
    prompt: string
    image_url?: string
    tail_image_url?: string
    duration?: string
    resolution?: string
    negative_prompt?: string
    cfg_scale?: number
  }
  callBackUrl?: string
}

// Build payload for Veo models via KIE.AI
export interface VeoPayload {
  prompt: string
  model: 'veo3' | 'veo3_fast'
  aspectRatio?: '16:9' | '9:16' | 'Auto'
  imageUrls?: string[]
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO'
  seeds?: number
  enableTranslation?: boolean
  watermark?: string
  callBackUrl?: string
}

// Payload builder functions
export function buildKieStandardPayload(
  model: VideoModel,
  options: {
    prompt: string
    imageUrl?: string
    tailImageUrl?: string
    duration?: number
    resolution?: string
    negativePrompt?: string
    cfgScale?: number
  }
): KieStandardPayload {
  const payload: KieStandardPayload = {
    model: model.modelId,
    input: {
      prompt: options.prompt.slice(0, model.maxPromptLength),
    },
  }

  if (options.imageUrl) {
    payload.input.image_url = options.imageUrl
  }

  if (options.tailImageUrl && model.features.tailImage) {
    payload.input.tail_image_url = options.tailImageUrl
  }

  if (options.duration && model.features.durations.includes(options.duration)) {
    payload.input.duration = String(options.duration)
  } else {
    payload.input.duration = String(model.features.durations[0])
  }

  if (options.resolution && model.features.resolution?.includes(options.resolution)) {
    payload.input.resolution = options.resolution
  }

  if (options.negativePrompt) {
    payload.input.negative_prompt = options.negativePrompt
  }

  if (options.cfgScale !== undefined) {
    payload.input.cfg_scale = Math.min(1, Math.max(0, options.cfgScale))
  }

  return payload
}

export function buildVeoPayload(
  model: VideoModel,
  options: {
    prompt: string
    imageUrls?: string[]
    aspectRatio?: string
    duration?: number
    enableTranslation?: boolean
    watermark?: string
  }
): VeoPayload {
  const payload: VeoPayload = {
    prompt: options.prompt.slice(0, model.maxPromptLength),
    model: model.modelId as 'veo3' | 'veo3_fast',
  }

  // Determine generation type based on images
  if (options.imageUrls && options.imageUrls.length > 0) {
    payload.imageUrls = options.imageUrls
    
    if (options.imageUrls.length === 1) {
      payload.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO'
    } else if (options.imageUrls.length === 2) {
      payload.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO'
    } else if (options.imageUrls.length <= 3 && model.modelId === 'veo3_fast') {
      payload.generationType = 'REFERENCE_2_VIDEO'
    }
  } else {
    payload.generationType = 'TEXT_2_VIDEO'
  }

  // Aspect ratio
  if (options.aspectRatio && ['16:9', '9:16'].includes(options.aspectRatio)) {
    payload.aspectRatio = options.aspectRatio as '16:9' | '9:16'
  } else {
    payload.aspectRatio = '16:9'
  }

  // Enable translation for non-English prompts
  payload.enableTranslation = options.enableTranslation ?? true

  // Watermark if provided
  if (options.watermark) {
    payload.watermark = options.watermark
  }

  return payload
}

// Response types
export interface KieCreateTaskResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

export interface KieQueryStatusResponse {
  code: number
  msg: string
  data: {
    taskId: string
    model: string
    state: 'waiting' | 'success' | 'fail'
    param: string
    resultJson?: string
    failCode?: string
    failMsg?: string
    costTime?: number
    completeTime?: number
    createTime: number
  }
}

export interface VeoGenerateResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

// Parse result from KIE.AI response
export function parseKieResult(resultJson: string): { videoUrls: string[] } {
  try {
    const result = JSON.parse(resultJson)
    return {
      videoUrls: result.resultUrls || [],
    }
  } catch {
    return { videoUrls: [] }
  }
}

// ============ GEMINI DIRECT INTEGRATION ============

export interface GeminiVideoConfig {
  aspectRatio?: '16:9' | '9:16'
  resolution?: '720p' | '1080p'
  durationSeconds?: 4 | 6 | 8
  negativePrompt?: string
  personGeneration?: 'allow_all' | 'allow_adult' | 'dont_allow'
}

export interface GeminiVideoResult {
  success: boolean
  operationName?: string
  videoUrl?: string
  videoBytes?: Buffer
  error?: string
}

// Initialize Gemini client
function getGeminiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is required - either pass it as parameter or set environment variable')
  }
  return new GoogleGenAI({ apiKey: key })
}

// Start video generation with Gemini Direct
export async function startGeminiVideoGeneration(
  model: VideoModel,
  options: {
    prompt: string
    imageBase64?: string
    imageMimeType?: string
    config?: GeminiVideoConfig
    apiKey?: string
  }
): Promise<{ operationName: string }> {
  const ai = getGeminiClient(options.apiKey)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateOptions: any = {
    model: model.modelId,
    prompt: options.prompt.slice(0, model.maxPromptLength),
  }

  // Add image if provided (for image-to-video)
  if (options.imageBase64 && options.imageMimeType) {
    generateOptions.image = {
      imageBytes: options.imageBase64,
      mimeType: options.imageMimeType,
    }
  }

  // Add configuration
  if (options.config) {
    generateOptions.config = {
      aspectRatio: options.config.aspectRatio || '16:9',
      negativePrompt: options.config.negativePrompt,
      // Note: 'allow_all' is not supported, use 'allow_adult' instead
      personGeneration: options.config.personGeneration === 'allow_all' 
        ? 'allow_adult' 
        : (options.config.personGeneration || 'allow_adult'),
    }

    // Note: durationSeconds and resolution are controlled by Gemini internally
    // for preview models, but we can set them if supported
  }

  const operation = await ai.models.generateVideos(generateOptions)
  
  return {
    operationName: operation.name || '',
  }
}

// Poll for video generation completion
export async function pollGeminiVideoStatus(
  operationName: string,
  apiKey?: string
): Promise<GeminiVideoResult> {
  const ai = getGeminiClient(apiKey)
  
  // Reconstruct operation object from name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operation: any = { name: operationName, done: false }
  
  try {
    const updatedOperation = await ai.operations.getVideosOperation({ 
      operation 
    })
    
    if (!updatedOperation.done) {
      return {
        success: false,
        operationName: updatedOperation.name,
        error: 'in_progress',
      }
    }

    // Video is ready
    const generatedVideo = updatedOperation.response?.generatedVideos?.[0]
    if (!generatedVideo?.video) {
      return {
        success: false,
        error: 'No video generated',
      }
    }

    // The video URI is available in the response
    // Note: The URI can be used directly to download the video
    const videoUri = generatedVideo.video.uri
    
    return {
      success: true,
      videoUrl: videoUri,
      operationName: updatedOperation.name,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper to check if model is Gemini Direct
export function isGeminiDirectModel(modelId: string): boolean {
  const model = getVideoModel(modelId)
  return model?.provider === 'gemini'
}

// Helper to get Gemini models only
export function getGeminiModels(): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.provider === 'gemini')
}

// Helper to get KIE models only
export function getKieModels(): VideoModel[] {
  return VIDEO_MODELS.filter(m => m.provider === 'kie')
}

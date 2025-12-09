// AI Provider Service - Abstraction layer for AI integrations
// Supports Gemini 2.5 Flash / 3.0 Pro and KIE.ai
// KIE.ai Models: Nano Banana Pro, Flux 2, Seedream V4/4.5, Nano Banana Edit, Topaz Upscale

export type AIProvider = 'gemini' | 'kieai'
export type GeminiModel = 'gemini-2.5-flash' | 'gemini-3.0-pro'

// KIE.AI Image Model Types
export type KieImageModelType = 'text-to-image' | 'image-to-image' | 'edit' | 'upscale'

export type KieImageModel = 
  // Text-to-Image
  | 'nano-banana-pro'
  | 'flux-2-pro-text-to-image'
  | 'flux-2-flex-text-to-image'
  | 'seedream-v4-text-to-image'
  | 'seedream-4-5-text-to-image' // NEW: Seedream 4.5
  // Image-to-Image
  | 'flux-2-pro-image-to-image'
  | 'flux-2-flex-image-to-image'
  // Edit
  | 'nano-banana-edit'
  | 'seedream-v4-edit'
  | 'seedream-4-5-edit' // NEW: Seedream 4.5 Edit
  // Upscale
  | 'topaz-image-upscale'

export type VideoModel = 'veo-3.1'

interface GenerateImageOptions {
  prompt: string
  systemPrompt?: string
  style?: string
  aspectRatio?: string
  provider?: AIProvider
  model?: KieImageModel
  numVariants?: number
}

interface GenerateVideoOptions {
  prompt: string
  systemPrompt?: string
  duration?: number // in seconds
  format?: '9:16' | '16:9' | '1:1'
  references?: string[] // URLs to reference images
  provider?: AIProvider
  model?: VideoModel
  withAudio?: boolean
}

interface GenerateCaptionOptions {
  projectId?: string
  imageUrl?: string
  imageAnalysis?: string
  language: 'de' | 'en' | 'tr'
  tone: string
  systemPrompt?: string
  multiLang?: boolean
  model?: GeminiModel
  hashtagCount?: number
}

interface AIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface GeneratedImage {
  url: string
  metadata: {
    model: string
    prompt: string
    style?: string
    aspectRatio?: string
  }
}

interface GeneratedVideo {
  url: string
  thumbnailUrl?: string
  duration: number
  metadata: {
    model: string
    prompt: string
    format?: string
  }
}

interface GeneratedCaption {
  text: string
  hashtags: string[]
  language: string
  tone: string
}

// Gemini API Integration
async function callGeminiAPI(
  apiKey: string,
  model: GeminiModel,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`
  
  const messages = []
  
  if (systemPrompt) {
    messages.push({
      role: 'user',
      parts: [{ text: `System Context: ${systemPrompt}` }],
    })
    messages.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow this context for all my responses.' }],
    })
  }
  
  messages.push({
    role: 'user',
    parts: [{ text: prompt }],
  })

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Gemini API request failed')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// KIE.ai API Endpoints for different models
// Note: Seedream 4.5 uses the universal createTask endpoint with model ID
const KIE_API_ENDPOINTS: Record<KieImageModel, string> = {
  'nano-banana-pro': 'https://api.kie.ai/api/models/google/nano-banana-pro',
  'flux-2-pro-text-to-image': 'https://api.kie.ai/api/models/flux-2/pro-text-to-image',
  'flux-2-flex-text-to-image': 'https://api.kie.ai/api/models/flux-2/flex-text-to-image',
  'seedream-v4-text-to-image': 'https://api.kie.ai/api/models/bytedance/seedream-v4-text-to-image',
  'seedream-4-5-text-to-image': 'https://api.kie.ai/api/v1/jobs/createTask', // Seedream 4.5 uses createTask
  'flux-2-pro-image-to-image': 'https://api.kie.ai/api/models/flux-2/pro-image-to-image',
  'flux-2-flex-image-to-image': 'https://api.kie.ai/api/models/flux-2/flex-image-to-image',
  'nano-banana-edit': 'https://api.kie.ai/api/models/google/nano-banana-edit',
  'seedream-v4-edit': 'https://api.kie.ai/api/models/bytedance/seedream-v4-edit',
  'seedream-4-5-edit': 'https://api.kie.ai/api/v1/jobs/createTask', // Seedream 4.5 Edit uses createTask
  'topaz-image-upscale': 'https://api.kie.ai/api/models/topaz/image-upscale',
}

// Seedream 4.5 Model IDs for createTask API
const SEEDREAM_45_MODELS = {
  'seedream-4-5-text-to-image': 'seedream/4.5-text-to-image',
  'seedream-4-5-edit': 'seedream/4.5-edit',
}

// KIE.ai API Integration for Images
async function callKieImageAPI(
  apiKey: string,
  options: GenerateImageOptions
): Promise<GeneratedImage[]> {
  const model = options.model || 'nano-banana-pro'
  const endpoint = KIE_API_ENDPOINTS[model]
  
  if (!endpoint) {
    throw new Error(`Unknown KIE.ai model: ${model}`)
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      aspect_ratio: options.aspectRatio || '1:1',
      resolution: '1K',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'KIE.ai image generation failed')
  }

  const data = await response.json()
  
  // Handle various response formats
  let imageUrl: string | undefined
  if (data.images?.[0]?.url) {
    imageUrl = data.images[0].url
  } else if (data.data?.[0]?.url) {
    imageUrl = data.data[0].url
  } else if (data.output_url) {
    imageUrl = data.output_url
  } else if (data.url) {
    imageUrl = data.url
  }

  if (!imageUrl) {
    throw new Error('No image URL in KIE.ai response')
  }

  return [{
    url: imageUrl,
    metadata: {
      model,
      prompt: options.prompt,
      style: options.style,
      aspectRatio: options.aspectRatio,
    },
  }]
}

// KIE.ai API Integration for Videos
async function callKieVideoAPI(
  apiKey: string,
  options: GenerateVideoOptions
): Promise<GeneratedVideo> {
  const response = await fetch('https://api.kieai.xyz/v1/video/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'veo-3.1',
      prompt: options.prompt,
      duration: options.duration || 4,
      aspect_ratio: options.format || '9:16',
      references: options.references || [],
      with_audio: options.withAudio ?? true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'KIE.ai video generation failed')
  }

  const data = await response.json()
  
  return {
    url: data.data.url,
    thumbnailUrl: data.data.thumbnail_url,
    duration: options.duration || 4,
    metadata: {
      model: options.model || 'veo-3.1',
      prompt: options.prompt,
      format: options.format,
    },
  }
}

// Build image prompt using Nano Banana Pro style
function buildImagePrompt(options: {
  systemPrompt?: string
  presetTemplate?: string
  userPrompt: string
  style?: string
  productName?: string
}): string {
  const parts: string[] = []

  // Add preset template if available
  if (options.presetTemplate) {
    let template = options.presetTemplate
    if (options.productName) {
      template = template.replace('[PRODUKTNAME]', options.productName)
    }
    parts.push(template)
  }

  // Add user prompt
  if (options.userPrompt) {
    parts.push(options.userPrompt)
  }

  // Add style if specified
  if (options.style) {
    parts.push(`Style: ${options.style}`)
  }

  // Add system prompt context
  if (options.systemPrompt) {
    parts.push(`Brand Context: ${options.systemPrompt}`)
  }

  return parts.join('\n\n')
}

// Build video prompt using Veo 3.1 style: [Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
function buildVideoPrompt(options: {
  systemPrompt?: string
  presetTemplate?: string
  userPrompt: string
  cinematography?: string
  subject?: string
  action?: string
  context?: string
  style?: string
}): string {
  const parts: string[] = []

  // Add preset template if available
  if (options.presetTemplate) {
    parts.push(options.presetTemplate)
  }

  // Build structured prompt
  const structured: string[] = []
  if (options.cinematography) structured.push(`Cinematography: ${options.cinematography}`)
  if (options.subject) structured.push(`Subject: ${options.subject}`)
  if (options.action) structured.push(`Action: ${options.action}`)
  if (options.context) structured.push(`Context: ${options.context}`)
  if (options.style) structured.push(`Style & Ambiance: ${options.style}`)
  
  if (structured.length > 0) {
    parts.push(structured.join('. '))
  }

  // Add user prompt
  if (options.userPrompt) {
    parts.push(options.userPrompt)
  }

  // Add brand context
  if (options.systemPrompt) {
    parts.push(`Brand Guidelines: ${options.systemPrompt}`)
  }

  return parts.join('\n\n')
}

// Main AI Provider Service Class
export class AIProviderService {
  private geminiApiKey?: string
  private kieApiKey?: string
  private systemPrompt?: string

  constructor(options: {
    geminiApiKey?: string
    kieApiKey?: string
    systemPrompt?: string
  }) {
    this.geminiApiKey = options.geminiApiKey
    this.kieApiKey = options.kieApiKey
    this.systemPrompt = options.systemPrompt
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt
  }

  async generateImage(options: GenerateImageOptions): Promise<AIResponse<GeneratedImage[]>> {
    try {
      if (!this.kieApiKey) {
        throw new Error('KIE.ai API key not configured')
      }

      const fullPrompt = buildImagePrompt({
        systemPrompt: options.systemPrompt || this.systemPrompt,
        userPrompt: options.prompt,
        style: options.style,
      })

      const images = await callKieImageAPI(this.kieApiKey, {
        ...options,
        prompt: fullPrompt,
      })

      return { success: true, data: images }
    } catch (error) {
      console.error('Image generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      }
    }
  }

  async generateVideo(options: GenerateVideoOptions): Promise<AIResponse<GeneratedVideo>> {
    try {
      if (!this.kieApiKey) {
        throw new Error('KIE.ai API key not configured')
      }

      const fullPrompt = buildVideoPrompt({
        systemPrompt: options.systemPrompt || this.systemPrompt,
        userPrompt: options.prompt,
      })

      const video = await callKieVideoAPI(this.kieApiKey, {
        ...options,
        prompt: fullPrompt,
      })

      return { success: true, data: video }
    } catch (error) {
      console.error('Video generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed',
      }
    }
  }

  async generateCaption(options: GenerateCaptionOptions): Promise<AIResponse<GeneratedCaption[]>> {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured')
      }

      const model = options.model || 'gemini-2.5-flash'
      
      const languageNames: Record<string, string> = {
        de: 'German',
        en: 'English',
        tr: 'Turkish',
      }

      const toneInstructions: Record<string, string> = {
        informative: 'informative and educational',
        emotional: 'emotional and heartfelt',
        funny: 'humorous and witty',
        professional: 'professional and business-like',
        casual: 'casual and friendly',
        inspiring: 'inspiring and motivational',
      }

      const prompt = `
You are a professional Instagram copywriter. Create engaging captions for Instagram posts.

${options.systemPrompt ? `Brand Context:\n${options.systemPrompt}\n` : ''}
${options.imageAnalysis ? `Image Analysis:\n${options.imageAnalysis}\n` : ''}

Generate 3 different caption variations in ${languageNames[options.language]} with a ${toneInstructions[options.tone] || options.tone} tone.

For each caption:
1. Write an engaging caption (150-300 characters)
2. Include relevant emojis
3. Add a clear call-to-action
4. Suggest ${options.hashtagCount || 15} relevant hashtags (mix of popular and niche)

Format your response as JSON:
{
  "captions": [
    {
      "text": "Caption text with emojis...",
      "hashtags": ["hashtag1", "hashtag2", ...]
    }
  ]
}
`

      const response = await callGeminiAPI(
        this.geminiApiKey,
        model,
        prompt,
        options.systemPrompt
      )

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      const captions: GeneratedCaption[] = parsed.captions.map((c: { text: string; hashtags: string[] }) => ({
        text: c.text,
        hashtags: c.hashtags.map((h: string) => h.replace(/^#/, '')),
        language: options.language,
        tone: options.tone,
      }))

      return { success: true, data: captions }
    } catch (error) {
      console.error('Caption generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Caption generation failed',
      }
    }
  }

  async analyzeImage(imageUrl: string): Promise<AIResponse<string>> {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured')
      }

      // For image analysis, we'd need to use Gemini Vision
      // This is a simplified version
      const prompt = `
Analyze this image for Instagram content creation:
- What is the main subject?
- What is the mood/atmosphere?
- What colors dominate?
- What story does it tell?
- Who would be interested in this content?

Image URL: ${imageUrl}
`

      const analysis = await callGeminiAPI(
        this.geminiApiKey,
        'gemini-2.5-flash',
        prompt,
        this.systemPrompt
      )

      return { success: true, data: analysis }
    } catch (error) {
      console.error('Image analysis error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed',
      }
    }
  }

  async generateGrowthInsights(
    analyticsData: Record<string, unknown>,
    options?: { model?: GeminiModel }
  ): Promise<AIResponse<string>> {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured')
      }

      const prompt = `
You are an Instagram growth strategist. Analyze the following engagement data and provide actionable insights.

${this.systemPrompt ? `Brand Context:\n${this.systemPrompt}\n` : ''}

Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Provide:
1. Key observations about content performance
2. Which content types work best
3. Optimal posting times
4. Hashtag effectiveness
5. 3-5 specific recommendations for improving engagement
6. Content ideas based on what's working

Format your response in a clear, actionable way.
`

      const insights = await callGeminiAPI(
        this.geminiApiKey,
        options?.model || 'gemini-3.0-pro',
        prompt,
        this.systemPrompt
      )

      return { success: true, data: insights }
    } catch (error) {
      console.error('Growth insights error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Growth insights generation failed',
      }
    }
  }
}

export default AIProviderService

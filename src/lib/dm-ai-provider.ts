// AI Provider Service for Direct Messages
// Handles AI-powered DM response generation using Gemini

export type DMTone = 'friendly' | 'professional' | 'casual'
export type DMLanguage = 'de' | 'en' | 'tr'
export type GeminiModel = 'gemini-2.5-flash' | 'gemini-3.0-pro'

interface MessageContext {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface GenerateDMResponseOptions {
  incomingMessage: string
  conversationHistory?: MessageContext[]
  senderUsername?: string
  senderName?: string
  language?: DMLanguage
  tone?: DMTone
  systemPrompt?: string
  brandName?: string
  categoryResponses?: Record<string, string>
  keywords?: Record<string, string>
  maxLength?: number
  model?: GeminiModel
}

interface DMResponseResult {
  success: boolean
  response?: string
  confidence?: number
  detectedCategory?: string
  error?: string
}

interface AnalyzeMessageOptions {
  message: string
  categoryResponses?: Record<string, string>
  keywords?: Record<string, string>
}

interface MessageAnalysis {
  intent: string
  sentiment: 'positive' | 'neutral' | 'negative'
  category?: string
  needsHumanReview: boolean
  suggestedPriority: 'high' | 'medium' | 'low'
}

// Gemini API Integration for DM responses
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
        maxOutputTokens: 1024,
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

// Build conversation context for AI
function buildConversationContext(history?: MessageContext[]): string {
  if (!history || history.length === 0) return ''
  
  return history.map(msg => {
    const role = msg.role === 'user' ? 'Kunde' : 'Du'
    return `${role}: ${msg.content}`
  }).join('\n')
}

// Language-specific prompts
const languagePrompts: Record<DMLanguage, { greeting: string; instruction: string }> = {
  de: {
    greeting: 'Antworte auf Deutsch',
    instruction: 'Generiere eine hilfreiche, natürliche Antwort auf die Direktnachricht.',
  },
  en: {
    greeting: 'Respond in English',
    instruction: 'Generate a helpful, natural response to the direct message.',
  },
  tr: {
    greeting: 'Türkçe cevap ver',
    instruction: 'Doğrudan mesaja yardımcı ve doğal bir yanıt oluştur.',
  },
}

// Tone instructions
const toneInstructions: Record<DMTone, string> = {
  friendly: 'Sei freundlich, warm und einladend. Nutze gelegentlich Emojis, um die Nachricht lebendiger zu machen.',
  professional: 'Bleibe professionell und respektvoll. Verwende eine formelle aber zugängliche Sprache.',
  casual: 'Sei locker und entspannt, wie in einem Gespräch mit einem Freund. Emojis sind willkommen.',
}

// Main DM AI Provider Service Class
export class DMAIProviderService {
  private geminiApiKey: string
  private defaultLanguage: DMLanguage
  private defaultTone: DMTone
  private systemPrompt?: string
  private brandName?: string

  constructor(options: {
    geminiApiKey: string
    defaultLanguage?: DMLanguage
    defaultTone?: DMTone
    systemPrompt?: string
    brandName?: string
  }) {
    this.geminiApiKey = options.geminiApiKey
    this.defaultLanguage = options.defaultLanguage || 'de'
    this.defaultTone = options.defaultTone || 'friendly'
    this.systemPrompt = options.systemPrompt
    this.brandName = options.brandName
  }

  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt
  }

  setBrandName(name: string) {
    this.brandName = name
  }

  async generateResponse(options: GenerateDMResponseOptions): Promise<DMResponseResult> {
    try {
      const language = options.language || this.defaultLanguage
      const tone = options.tone || this.defaultTone
      const model = options.model || 'gemini-2.5-flash'
      const maxLength = options.maxLength || 500

      // Check for keyword matches first
      if (options.keywords) {
        const keywordResponse = this.matchKeywords(options.incomingMessage, options.keywords)
        if (keywordResponse) {
          return {
            success: true,
            response: keywordResponse,
            confidence: 1.0,
            detectedCategory: 'keyword_match',
          }
        }
      }

      // Build the system context
      const brandContext = options.brandName || this.brandName
        ? `Du antwortest im Namen von "${options.brandName || this.brandName}".`
        : ''
      
      const customSystemPrompt = options.systemPrompt || this.systemPrompt || ''
      
      const systemContext = `
Du bist ein hilfreicher Instagram DM-Assistent.
${brandContext}
${customSystemPrompt}

${toneInstructions[tone]}
${languagePrompts[language].greeting}.
      `.trim()

      // Build conversation context
      const conversationContext = buildConversationContext(options.conversationHistory)
      
      // Build category context if available
      let categoryContext = ''
      if (options.categoryResponses && Object.keys(options.categoryResponses).length > 0) {
        categoryContext = `
Hier sind spezifische Antwortvorlagen für bestimmte Themen:
${Object.entries(options.categoryResponses).map(([cat, resp]) => `- ${cat}: ${resp}`).join('\n')}
Wenn die Nachricht zu einem dieser Themen passt, orientiere dich an der entsprechenden Vorlage.
        `.trim()
      }

      // Build the main prompt
      const prompt = `
${languagePrompts[language].instruction}

${categoryContext}

${conversationContext ? `Bisherige Konversation:\n${conversationContext}\n` : ''}

Neue Nachricht von ${options.senderName || options.senderUsername || 'einem Kunden'}:
"${options.incomingMessage}"

Regeln:
- Halte die Antwort unter ${maxLength} Zeichen
- Sei hilfreich und beantworte die Frage direkt
- Wenn du keine Information hast, sage das ehrlich
- Schließe keine Signaturen oder formelle Grüße ein (wie "Mit freundlichen Grüßen")
- Die Antwort sollte natürlich klingen, wie eine echte DM

Antworte NUR mit dem Text der Nachricht, ohne zusätzliche Erklärungen oder Formatierungen.
      `.trim()

      const response = await callGeminiAPI(
        this.geminiApiKey,
        model,
        prompt,
        systemContext
      )

      // Clean up the response
      const cleanedResponse = response.trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^Antwort:\s*/i, '') // Remove "Antwort:" prefix if present
        .replace(/^Response:\s*/i, '')

      return {
        success: true,
        response: cleanedResponse,
        confidence: 0.85, // Base confidence for AI-generated responses
      }
    } catch (error) {
      console.error('DM response generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Response generation failed',
      }
    }
  }

  async analyzeMessage(options: AnalyzeMessageOptions): Promise<MessageAnalysis> {
    try {
      const prompt = `
Analysiere die folgende Instagram-Direktnachricht und gib eine JSON-Antwort:

Nachricht: "${options.message}"

Analysiere:
1. Intent (was will der Absender? z.B.: "frage", "beschwerde", "lob", "bestellung", "support", "small_talk")
2. Sentiment (positive, neutral, negative)
3. Kategorie (wenn zutreffend: faq, pricing, product, support, feedback, other)
4. Braucht menschliche Überprüfung? (bei sensiblen Themen, Beschwerden, komplexen Anfragen)
5. Priorität (high: dringend/wichtig, medium: normal, low: kann warten)

Antworte NUR im JSON-Format:
{
  "intent": "...",
  "sentiment": "...",
  "category": "...",
  "needsHumanReview": true/false,
  "suggestedPriority": "..."
}
      `.trim()

      const response = await callGeminiAPI(
        this.geminiApiKey,
        'gemini-2.5-flash',
        prompt
      )

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return {
          intent: 'unknown',
          sentiment: 'neutral',
          needsHumanReview: true,
          suggestedPriority: 'medium',
        }
      }

      const parsed = JSON.parse(jsonMatch[0])
      return {
        intent: parsed.intent || 'unknown',
        sentiment: parsed.sentiment || 'neutral',
        category: parsed.category,
        needsHumanReview: parsed.needsHumanReview ?? false,
        suggestedPriority: parsed.suggestedPriority || 'medium',
      }
    } catch (error) {
      console.error('Message analysis error:', error)
      return {
        intent: 'unknown',
        sentiment: 'neutral',
        needsHumanReview: true,
        suggestedPriority: 'medium',
      }
    }
  }

  private matchKeywords(message: string, keywords: Record<string, string>): string | null {
    const lowerMessage = message.toLowerCase()
    
    for (const [keyword, response] of Object.entries(keywords)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return response
      }
    }
    
    return null
  }

  // Generate multiple response suggestions
  async generateResponseSuggestions(
    message: string,
    options?: Partial<GenerateDMResponseOptions>
  ): Promise<{ suggestions: string[]; error?: string }> {
    try {
      const prompt = `
Generiere 3 verschiedene Antwortvarianten für diese Instagram-Direktnachricht:

Nachricht: "${message}"

${options?.brandName ? `Marke: ${options.brandName}` : ''}
${options?.systemPrompt ? `Kontext: ${options.systemPrompt}` : ''}

Generiere 3 unterschiedliche Antworten:
1. Kurz und freundlich
2. Ausführlicher und hilfreich
3. Mit Fragen zur Klärung

Antworte im JSON-Format:
{
  "suggestions": ["Antwort 1", "Antwort 2", "Antwort 3"]
}
      `.trim()

      const response = await callGeminiAPI(
        this.geminiApiKey,
        'gemini-2.5-flash',
        prompt
      )

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return { suggestions: [], error: 'Invalid response format' }
      }

      const parsed = JSON.parse(jsonMatch[0])
      return { suggestions: parsed.suggestions || [] }
    } catch (error) {
      console.error('Suggestions generation error:', error)
      return {
        suggestions: [],
        error: error instanceof Error ? error.message : 'Suggestions generation failed',
      }
    }
  }
}

export default DMAIProviderService

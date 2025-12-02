"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Settings2,
  Wand2,
  Copy,
  Check,
  Image as ImageIcon,
  Upload,
  X,
  FolderOpen,
  ImagePlus,
  Loader2,
  Brain,
  Zap,
  ChevronDown,
  ChevronRight,
  Save,
  Maximize2,
  ExternalLink,
  Instagram,
  Hash,
  FileText,
  Pencil,
  Smile,
  Minimize2,
  Megaphone,
  Heart,
  Briefcase,
  MessageCircle,
  HelpCircle,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Preset {
  id: string
  name: string
  description?: string
  promptTemplate: string
  style?: string
  category?: string
  aspectRatio?: string
}

interface ReferenceImage {
  id: string
  title: string
  fileUrl: string
  thumbnailUrl: string
}

interface ImageAnalysis {
  productName?: string
  productType?: string
  colors?: string[]
  mood?: string
  description?: string
  suggestedStyle?: string
}

type AIProvider = 'kieai' | 'gemini'
type GeminiModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'

// KIE.AI Models grouped by type
type KieModelType = 'text-to-image' | 'image-to-image' | 'upscale'

interface KieModelInfo {
  value: string
  label: string
  description: string
  type: KieModelType
  requiresImage: boolean
  maxImages?: number
  supportsResolution?: boolean
  supportsStepsGuidance?: boolean
  supportsUpscaleFactor?: boolean
  supportedAspectRatios?: string[]
  priceInfo?: string
}

// Models matching the backend KIE_AI_MODELS configuration
const KIE_MODELS: KieModelInfo[] = [
  // ===== Text-to-Image Models =====
  {
    value: "nano-banana-pro",
    label: "Nano Banana Pro",
    description: "Gemini 3 Pro Image • Bis 4K • Beste Qualität",
    type: "text-to-image",
    requiresImage: false,
    maxImages: 8,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "auto"],
    priceInfo: "18-24 Credits",
  },
  {
    value: "nano-banana",
    label: "Nano Banana",
    description: "Gemini 2.5 Flash • Schnell & günstig",
    type: "text-to-image",
    requiresImage: false,
    maxImages: 0,
    supportsResolution: false,
    supportedAspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "auto"],
    priceInfo: "4 Credits",
  },
  {
    value: "nano-banana-edit",
    label: "Nano Banana Edit",
    description: "Gemini 2.5 Flash • Bild bearbeiten • Bis 10 Bilder",
    type: "image-to-image",
    requiresImage: true,
    maxImages: 10,
    supportsResolution: false,
    supportedAspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "auto"],
    priceInfo: "4 Credits",
  },
  {
    value: "flux-2-pro-text",
    label: "Flux 2 Pro (T2I)",
    description: "Premium Text-zu-Bild • Bis 2K",
    type: "text-to-image",
    requiresImage: false,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "16:9", "21:9", "3:2", "4:5", "5:4", "4:3", "3:4", "2:3", "9:16", "9:21"],
    priceInfo: "5 Credits",
  },
  {
    value: "flux-2-flex-text",
    label: "Flux 2 Flex (T2I)",
    description: "Budget Text-zu-Bild • Bis 2K",
    type: "text-to-image",
    requiresImage: false,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "16:9", "21:9", "3:2", "4:5", "5:4", "4:3", "3:4", "2:3", "9:16", "9:21"],
    priceInfo: "2 Credits",
  },
  {
    value: "seedream-v4-text",
    label: "Seedream V4 (T2I)",
    description: "ByteDance • Bis 4K • Günstig",
    type: "text-to-image",
    requiresImage: false,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "4:3", "3:2", "16:9", "21:9", "3:4", "2:3", "9:16"],
    priceInfo: "2 Credits",
  },
  
  // ===== Image-to-Image Models =====
  {
    value: "flux-2-pro-img",
    label: "Flux 2 Pro (I2I)",
    description: "Premium Bild-zu-Bild • Bis 8 Referenzbilder",
    type: "image-to-image",
    requiresImage: true,
    maxImages: 8,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "16:9", "21:9", "3:2", "4:5", "5:4", "4:3", "3:4", "2:3", "9:16", "auto"],
    priceInfo: "5 Credits",
  },
  {
    value: "flux-2-flex-img",
    label: "Flux 2 Flex (I2I)",
    description: "Budget Bild-zu-Bild • Bis 8 Referenzbilder",
    type: "image-to-image",
    requiresImage: true,
    maxImages: 8,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "16:9", "21:9", "3:2", "4:5", "5:4", "4:3", "3:4", "2:3", "9:16", "auto"],
    priceInfo: "14 Credits",
  },
  {
    value: "seedream-v4-edit",
    label: "Seedream V4 Edit",
    description: "ByteDance • Bild bearbeiten • Bis 10 Bilder",
    type: "image-to-image",
    requiresImage: true,
    maxImages: 10,
    supportsResolution: true,
    supportedAspectRatios: ["1:1", "4:3", "3:2", "16:9", "21:9", "3:4", "2:3", "9:16"],
    priceInfo: "3.5 Credits",
  },
  
  // ===== Upscale Model =====
  {
    value: "topaz-image-upscale",
    label: "Topaz Upscale",
    description: "AI Upscaling • 1x, 2x, 4x, 8x",
    type: "upscale",
    requiresImage: true,
    maxImages: 1,
    supportsUpscaleFactor: true,
    priceInfo: "2 Credits",
  },
]

export default function GenerateImagePage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const referenceId = searchParams.get("referenceId")

  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9" | "2:3" | "3:2" | "3:4" | "4:3" | "5:4" | "21:9" | "auto">("1:1")
  
  // Provider & Model State
  const [provider, setProvider] = useState<AIProvider>("kieai")
  const [kieModel, setKieModel] = useState<string>("nano-banana-pro")
  const [geminiModel, setGeminiModel] = useState<GeminiModel>("gemini-2.5-flash-image")
  
  // Advanced KIE.AI Options
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("1K")
  const [upscaleFactor, setUpscaleFactor] = useState<"1" | "2" | "4" | "8">("2")
  
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reference Image State
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null)
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [galleryImages, setGalleryImages] = useState<ReferenceImage[]>([])
  const [isUploadingRef, setIsUploadingRef] = useState(false)
  const refFileInputRef = useRef<HTMLInputElement>(null)
  const previewFileInputRef = useRef<HTMLInputElement>(null)
  
  // Image Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  
  // Prompt Enhancement State
  const [isEnhancing, setIsEnhancing] = useState(false)
  
  // Save & Preview State
  const [isSaving, setIsSaving] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  
  // Instagram Content State
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [instagramCaption, setInstagramCaption] = useState("")
  const [instagramHashtags, setInstagramHashtags] = useState<string[]>([])
  const [instagramFullText, setInstagramFullText] = useState("")
  const [captionCopied, setCaptionCopied] = useState(false)
  const [hashtagsCopied, setHashtagsCopied] = useState(false)
  const [fullTextCopied, setFullTextCopied] = useState(false)
  const [isRefiningCaption, setIsRefiningCaption] = useState(false)
  const [captionEditMode, setCaptionEditMode] = useState(false)
  
  // Collapsible Categories State
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  useEffect(() => {
    fetchPresets()
    fetchGalleryImages()
  }, [])

  // Load reference image from URL param and auto-analyze
  useEffect(() => {
    if (referenceId && galleryImages.length > 0) {
      const image = galleryImages.find(img => img.id === referenceId)
      if (image && !referenceImage) {
        setReferenceImage(image)
        // Auto-analyze the loaded reference image
        analyzeImageWithAI(image.fileUrl)
      }
    }
  }, [referenceId, galleryImages])

  const fetchPresets = async () => {
    try {
      const response = await fetch("/api/presets?type=IMAGE&includePublic=true")
      if (response.ok) {
        const data = await response.json()
        setPresets(data.presets)
      }
    } catch (error) {
      console.error("Error fetching presets:", error)
    }
  }

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch("/api/upload/image")
      if (response.ok) {
        const data = await response.json()
        setGalleryImages(data.images)
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error)
    }
  }

  const handleUploadReference = async (files: FileList) => {
    if (files.length === 0) return
    
    setIsUploadingRef(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("title", files[0].name.replace(/\.[^/.]+$/, ""))

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()
      setReferenceImage(data.project)
      await fetchGalleryImages()
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setIsUploadingRef(false)
    }
  }

  const handlePresetSelect = (presetId: string | null) => {
    setSelectedPreset(presetId)
    if (presetId) {
      const preset = presets.find(p => p.id === presetId)
      if (preset) {
        // Auto-fill prompt with template (user can customize)
        if (!prompt || prompt === presets.find(p => p.id === selectedPreset)?.promptTemplate) {
          setPrompt(preset.promptTemplate)
        }
        // Auto-set aspect ratio if preset has one
        if (preset.aspectRatio) {
          setAspectRatio(preset.aspectRatio as typeof aspectRatio)
        }
      }
    }
  }

  const getPresetCategories = () => {
    const categories = new Map<string, Preset[]>()
    presets.forEach(preset => {
      const cat = preset.category || 'other'
      if (!categories.has(cat)) {
        categories.set(cat, [])
      }
      categories.get(cat)!.push(preset)
    })
    return categories
  }

  const categoryLabels: Record<string, string> = {
    product: '📦 Produkt',
    lifestyle: '🌿 Lifestyle',
    portrait: '👤 Portrait',
    food: '🍽️ Food',
    pet: '🐾 Haustiere',
    story: '📱 Story',
    carousel: '🎠 Karussell',
    brand: '✨ Branding',
    social: '📲 Social Media',
    other: '🎨 Sonstige'
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Bitte gib einen Prompt ein")
      return
    }

    // Check if model requires image
    const modelInfo = getCurrentModelInfo()
    if (provider === 'kieai' && modelInfo?.requiresImage && !referenceImage) {
      setError("Dieses Modell benötigt ein Eingabebild")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const currentModel = provider === 'kieai' ? kieModel : geminiModel
      
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          aspectRatio,
          provider,
          model: currentModel,
          presetId: selectedPreset || undefined,
          projectId: projectId || undefined,
          referenceImageUrl: referenceImage?.fileUrl || undefined,
          referenceImageId: referenceImage?.id || undefined,
          imageAnalysis: imageAnalysis || undefined,
          // KIE.AI Extended Options
          resolution: modelInfo?.supportsResolution ? resolution : undefined,
          upscaleFactor: modelInfo?.supportsUpscaleFactor ? upscaleFactor : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler bei der Bildgenerierung")
        return
      }

      setGeneratedImage(data.imageUrl)
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Analyze image with Gemini 2.5 Flash
  const analyzeImageWithAI = async (imageUrl: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        setImageAnalysis(data.analysis)
        
        // Auto-fill preset prompt if one is selected
        if (selectedPreset && data.analysis) {
          const preset = presets.find(p => p.id === selectedPreset)
          if (preset) {
            let filledPrompt = preset.promptTemplate
            if (data.analysis.productName) {
              filledPrompt = filledPrompt.replace(/\[PRODUKTNAME\]/g, data.analysis.productName)
            }
            if (data.analysis.colors?.length > 0) {
              filledPrompt = filledPrompt.replace(/\[MARKENFARBE\]/g, data.analysis.colors[0])
              filledPrompt = filledPrompt.replace(/\[HEX-FARBEN\]/g, data.analysis.colors.join(', '))
            }
            if (data.analysis.mood) {
              filledPrompt = filledPrompt.replace(/\[STIMMUNG\]/g, data.analysis.mood)
            }
            if (data.analysis.suggestedStyle) {
              filledPrompt = filledPrompt.replace(/\[STIL\]/g, data.analysis.suggestedStyle)
            }
            setPrompt(filledPrompt)
          }
        }
      }
    } catch (error) {
      console.error("Image analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Enhance prompt with AI using Google Prompting Guidelines
  const enhancePromptWithAI = async () => {
    if (!prompt.trim()) {
      setError("Bitte gib zuerst einen Prompt ein")
      return
    }
    
    setIsEnhancing(true)
    setError(null)
    
    try {
      // Determine target category from selected preset
      let targetCategory = 'other'
      if (selectedPreset) {
        const preset = presets.find(p => p.id === selectedPreset)
        if (preset?.category) {
          targetCategory = preset.category
        }
      }
      
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageAnalysis: imageAnalysis || undefined,
          targetCategory,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Fehler bei der Prompt-Verbesserung")
        return
      }
      
      // Update prompt with enhanced version
      setPrompt(data.enhancedPrompt)
      
      // Optional: Show a toast or notification
      if (data.usedBrandContext) {
        console.log("Prompt wurde mit Brand-Kontext aus dem System Prompt verbessert")
      }
    } catch (err) {
      console.error("Prompt enhancement error:", err)
      setError("Fehler bei der Prompt-Verbesserung")
    } finally {
      setIsEnhancing(false)
    }
  }

  // Handle image selection (from upload or gallery) with auto-analysis
  const handleImageSelected = async (image: ReferenceImage) => {
    setReferenceImage(image)
    setGeneratedImage(null) // Clear any generated image
    // Auto-analyze the image
    await analyzeImageWithAI(image.fileUrl)
  }

  // Upload directly in preview area
  const handlePreviewUpload = async (files: FileList) => {
    if (files.length === 0) return
    
    setIsUploadingRef(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("title", files[0].name.replace(/\.[^/.]+$/, ""))

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()
      await fetchGalleryImages()
      // Auto-select and analyze the uploaded image
      await handleImageSelected(data.project)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setIsUploadingRef(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `instaai-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      console.error("Error downloading image")
    }
  }

  // Save generated image to gallery
  const handleSaveToGallery = async () => {
    if (!generatedImage) return
    
    setIsSaving(true)
    setSavedSuccess(false)
    setError(null)
    
    try {
      const currentModel = provider === 'kieai' ? kieModel : geminiModel
      const presetName = selectedPreset 
        ? presets.find(p => p.id === selectedPreset)?.name 
        : undefined
      
      const response = await fetch("/api/upload/save-generated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          title: presetName 
            ? `${presetName} - ${new Date().toLocaleDateString('de-DE')}`
            : `Generiertes Bild - ${new Date().toLocaleDateString('de-DE')}`,
          prompt: prompt,
          model: currentModel,
          provider: provider,
          presetId: selectedPreset || undefined,
          aspectRatio: aspectRatio,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Speichern fehlgeschlagen")
      }
      
      setSavedSuccess(true)
      // Refresh gallery images
      await fetchGalleryImages()
      
      // Reset success message after 3 seconds
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyPrompt = async () => {
    const success = await copyToClipboard(prompt)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Helper function to copy text to clipboard with fallback
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false
    
    try {
      // Try modern clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    } catch (err) {
      console.error('Copy failed:', err)
      return false
    }
  }

  // Generate Instagram caption and hashtags
  const generateInstagramContent = async () => {
    if (!generatedImage) {
      setError("Bitte zuerst ein Bild generieren")
      return
    }
    
    setIsGeneratingCaption(true)
    setError(null)
    setInstagramCaption("")
    setInstagramHashtags([])
    setInstagramFullText("")
    
    try {
      const response = await fetch("/api/generate/instagram-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          imageAnalysis: imageAnalysis || undefined,
          prompt: prompt || undefined,
          language: "de",
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Caption-Generierung")
      }
      
      setInstagramCaption(data.caption || "")
      setInstagramHashtags(data.hashtags || [])
      // Build fullText if not provided by API
      const fullText = data.fullText || 
        (data.caption + (data.hashtags?.length > 0 ? '\n\n' + data.hashtags.join(' ') : ''))
      setInstagramFullText(fullText || "")
      
      if (data.brandContextUsed) {
        console.log("Instagram-Text wurde mit deinem Marken-Kontext erstellt")
      }
    } catch (err) {
      console.error("Instagram caption error:", err)
      setError(err instanceof Error ? err.message : "Fehler bei der Caption-Generierung")
    } finally {
      setIsGeneratingCaption(false)
    }
  }
  
  // Copy functions for Instagram content
  const handleCopyCaption = async () => {
    if (!instagramCaption) return
    const success = await copyToClipboard(instagramCaption)
    if (success) {
      setCaptionCopied(true)
      setTimeout(() => setCaptionCopied(false), 2000)
    }
  }
  
  const handleCopyHashtags = async () => {
    if (!instagramHashtags || instagramHashtags.length === 0) return
    const success = await copyToClipboard(instagramHashtags.join(" "))
    if (success) {
      setHashtagsCopied(true)
      setTimeout(() => setHashtagsCopied(false), 2000)
    }
  }
  
  const handleCopyFullText = async () => {
    // Build full text from caption + hashtags if fullText is empty
    const textToCopy = instagramFullText || 
      (instagramCaption + (instagramHashtags.length > 0 ? '\n\n' + instagramHashtags.join(' ') : ''))
    if (!textToCopy) return
    const success = await copyToClipboard(textToCopy)
    if (success) {
      setFullTextCopied(true)
      setTimeout(() => setFullTextCopied(false), 2000)
    }
  }

  // Refine caption with AI tools
  type RefineAction = "shorten" | "lengthen" | "more_emojis" | "less_emojis" | "more_cta" | "more_emotion" | "professional" | "casual" | "question" | "story"
  
  const refineCaption = async (action: RefineAction) => {
    if (!instagramCaption) return
    
    setIsRefiningCaption(true)
    
    try {
      const response = await fetch("/api/generate/instagram-caption/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: instagramCaption,
          action,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Bearbeitung")
      }
      
      setInstagramCaption(data.caption)
      // Update full text with new caption
      const newFullText = data.caption + "\n\n" + instagramHashtags.join(" ")
      setInstagramFullText(newFullText)
    } catch (err) {
      console.error("Refine caption error:", err)
      setError(err instanceof Error ? err.message : "Fehler bei der Bearbeitung")
    } finally {
      setIsRefiningCaption(false)
    }
  }

  // All possible aspect ratios with descriptions
  const allAspectRatios = [
    { value: "1:1", label: "1:1", description: "Quadratisch" },
    { value: "4:5", label: "4:5", description: "Portrait" },
    { value: "5:4", label: "5:4", description: "Landscape Soft" },
    { value: "3:4", label: "3:4", description: "Portrait Tall" },
    { value: "4:3", label: "4:3", description: "Landscape" },
    { value: "2:3", label: "2:3", description: "Poster" },
    { value: "3:2", label: "3:2", description: "Photo" },
    { value: "9:16", label: "9:16", description: "Story/Reel" },
    { value: "16:9", label: "16:9", description: "Widescreen" },
    { value: "21:9", label: "21:9", description: "Cinematic" },
    { value: "9:21", label: "9:21", description: "Ultra Tall" },
    { value: "auto", label: "Auto", description: "Automatisch" },
  ]

  // Get current model info
  const getCurrentModelInfo = () => KIE_MODELS.find(m => m.value === kieModel)

  // Get supported aspect ratios for current model
  const getSupportedAspectRatios = () => {
    if (provider === 'gemini') {
      // Gemini supports all standard ratios
      return ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]
    }
    const modelInfo = getCurrentModelInfo()
    if (modelInfo?.type === 'upscale') {
      // Upscale doesn't need aspect ratio selection
      return []
    }
    return modelInfo?.supportedAspectRatios || ["1:1", "16:9", "9:16", "4:3", "3:4"]
  }

  // Filter aspect ratios based on current model
  const aspectRatios = allAspectRatios.filter(ar => getSupportedAspectRatios().includes(ar.value))

  // Reset aspect ratio if current one is not supported by new model
  useEffect(() => {
    const supported = getSupportedAspectRatios()
    if (supported.length > 0 && !supported.includes(aspectRatio)) {
      setAspectRatio(supported[0] as typeof aspectRatio)
    }
  }, [kieModel, provider])

  const providers = [
    { value: "kieai", label: "KIE.ai", description: "Nano Banana Pro, Flux 2, Seedream, Topaz", icon: Zap },
    { value: "gemini", label: "Google Gemini", description: "Gemini Flash & Pro Image", icon: Brain },
  ]

  // Group KIE models by type
  const getKieModelsByType = (type: KieModelType) => KIE_MODELS.filter(m => m.type === type)

  const geminiModels = [
    { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash (Nano Banana)", description: "Schnell & effizient, 1024px" },
    { value: "gemini-3-pro-image-preview", label: "Gemini 3 Pro (Nano Banana Pro)", description: "Professionell bis 4K, Grounding" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bild generieren</h1>
        <p className="mt-1 text-muted-foreground">
          Erstelle beeindruckende KI-generierte Bilder für Instagram
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Presets - Now First and Prominent */}
          {presets.length > 0 && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-primary" />
                  1. Wähle ein Preset
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Starte mit einer optimierten Vorlage - du kannst sie anpassen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from(getPresetCategories()).map(([category, categoryPresets]) => {
                  const isExpanded = expandedCategories.has(category)
                  const hasSelectedPreset = categoryPresets.some(p => p.id === selectedPreset)
                  
                  return (
                    <div key={category} className="border border-border/30 rounded-lg overflow-hidden">
                      {/* Category Header - Clickable */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`w-full flex items-center justify-between p-3 text-left transition-all duration-200 ${
                          hasSelectedPreset 
                            ? "bg-primary/10 border-primary/30" 
                            : "bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm font-medium ${
                            hasSelectedPreset ? "text-primary" : "text-foreground"
                          }`}>
                            {categoryLabels[category] || category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({categoryPresets.length})
                          </span>
                        </div>
                        {hasSelectedPreset && (
                          <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                            Ausgewählt
                          </span>
                        )}
                      </button>
                      
                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className="p-3 pt-2 border-t border-border/30 bg-background/50">
                          <div className="grid grid-cols-2 gap-2">
                            {categoryPresets.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => handlePresetSelect(preset.id)}
                                className={`group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                                  selectedPreset === preset.id
                                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                                    : "border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30"
                                }`}
                              >
                                <span className={`font-medium text-sm ${
                                  selectedPreset === preset.id ? "text-primary" : "text-foreground"
                                }`}>
                                  {preset.name}
                                </span>
                                {preset.description && (
                                  <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {preset.description}
                                  </span>
                                )}
                                {selectedPreset === preset.id && (
                                  <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect(null)}
                  className={`w-full mt-2 ${!selectedPreset ? "text-primary" : "text-muted-foreground"}`}
                >
                  Oder starte ohne Preset →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Prompt */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Wand2 className="h-5 w-5 text-primary" />
                2. Passe den Prompt an
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedPreset 
                  ? "Ersetze [PRODUKTNAME] und passe Details an" 
                  : "Beschreibe das Bild, das du erstellen möchtest"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt" className="text-foreground">Bildbeschreibung</Label>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={enhancePromptWithAI}
                      disabled={!prompt || isEnhancing}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1"
                      title="Prompt mit KI verbessern (basierend auf Google Prompting Guidelines)"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span className="text-xs hidden sm:inline">Verbessern</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopyPrompt}
                      disabled={!prompt}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="z.B. A stylish coffee cup on a marble table, morning light streaming through a window, aesthetic minimalist photography, soft shadows..."
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary/20 border-border/50 focus:border-primary/50 focus:ring-primary/20 font-mono text-sm"
                />
                {selectedPreset && prompt.includes('[PRODUKTNAME]') && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    ⚠️ Ersetze [PRODUKTNAME] mit deinem echten Produktnamen
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Settings2 className="h-3 w-3" />
                {showAdvanced ? "Weniger Optionen" : "Erweiterte Optionen"}
              </button>

              {showAdvanced && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label htmlFor="negativePrompt" className="text-foreground">
                    Negative Prompt <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="negativePrompt"
                    placeholder="z.B. blurry, low quality, distorted"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="bg-secondary/20 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings2 className="h-5 w-5 text-primary" />
                3. Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reference Image */}
              <div className="space-y-3">
                <Label className="text-foreground">Referenzbild (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Lade ein Bild hoch, das als Vorlage oder Inspiration dient
                </p>
                
                {referenceImage ? (
                  <div className="relative rounded-xl border border-primary/50 bg-primary/5 p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={referenceImage.thumbnailUrl || referenceImage.fileUrl}
                        alt={referenceImage.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {referenceImage.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Wird als Referenz verwendet
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setReferenceImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => refFileInputRef.current?.click()}
                      disabled={isUploadingRef}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-secondary/20 p-4 text-muted-foreground hover:bg-secondary/40 hover:border-primary/30 transition-all"
                    >
                      {isUploadingRef ? (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mb-1" />
                          <span className="text-xs">Hochladen</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowGalleryPicker(true)}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-secondary/20 p-4 text-muted-foreground hover:bg-secondary/40 hover:border-primary/30 transition-all"
                    >
                      <FolderOpen className="h-5 w-5 mb-1" />
                      <span className="text-xs">Aus Galerie</span>
                    </button>
                  </div>
                )}
                <input
                  ref={refFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => e.target.files && handleUploadReference(e.target.files)}
                />
              </div>

              {/* Resolution Selection (for models that support it) */}
              {provider === 'kieai' && getCurrentModelInfo()?.supportsResolution && (
                <div className="space-y-3">
                  <Label className="text-foreground">Auflösung</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1K', '2K', '4K'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                          resolution === res
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                            : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="font-medium text-sm">{res}</span>
                        <span className="text-xs opacity-70">
                          {res === '1K' ? '1024px' : res === '2K' ? '2048px' : '4096px'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upscale Factor (for upscale model) */}
              {provider === 'kieai' && getCurrentModelInfo()?.supportsUpscaleFactor && (
                <div className="space-y-3">
                  <Label className="text-foreground">Vergrößerungsfaktor</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['1', '2', '4', '8'] as const).map((factor) => (
                      <button
                        key={factor}
                        onClick={() => setUpscaleFactor(factor)}
                        className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                          upscaleFactor === factor
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                            : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="font-medium text-sm">{factor}x</span>
                        <span className="text-xs opacity-70">
                          {factor === '8' ? 'Bis 8K' : factor === '4' ? 'Bis 4K' : factor === '2' ? 'Bis 2K' : 'Original'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Selection - First */}
              <div className="space-y-3">
                <Label className="text-foreground">1. KI-Provider wählen</Label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setProvider(p.value as AIProvider)}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                        provider === p.value
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <p.icon className="h-5 w-5" />
                      <div className="text-left">
                        <span className="font-medium text-sm block">{p.label}</span>
                        <span className="text-xs opacity-70">{p.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection - Second */}
              <div className="space-y-3">
                <Label className="text-foreground">2. Modell wählen</Label>
                {provider === 'kieai' ? (
                  <Select 
                    value={kieModel}
                    onValueChange={(value) => setKieModel(value)}
                  >
                    <SelectTrigger className="bg-secondary/20 border-border/50">
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {/* Text-to-Image Models */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-primary">✨ Text-zu-Bild</div>
                      {getKieModelsByType('text-to-image').map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.label}</span>
                            <span className="text-xs text-muted-foreground">{m.description}</span>
                            {m.priceInfo && <span className="text-xs text-green-600">{m.priceInfo}</span>}
                          </div>
                        </SelectItem>
                      ))}
                      
                      {/* Image-to-Image Models */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-blue-500 mt-2">🖼️ Bild-zu-Bild</div>
                      {getKieModelsByType('image-to-image').map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.label}</span>
                            <span className="text-xs text-muted-foreground">{m.description}</span>
                            {m.priceInfo && <span className="text-xs text-green-600">{m.priceInfo}</span>}
                          </div>
                        </SelectItem>
                      ))}
                      
                      {/* Upscale Models */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-purple-500 mt-2">🔍 Upscale</div>
                      {getKieModelsByType('upscale').map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.label}</span>
                            <span className="text-xs text-muted-foreground">{m.description}</span>
                            {m.priceInfo && <span className="text-xs text-green-600">{m.priceInfo}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select 
                    value={geminiModel}
                    onValueChange={(value) => setGeminiModel(value as GeminiModel)}
                  >
                    <SelectTrigger className="bg-secondary/20 border-border/50">
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {geminiModels.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex flex-col">
                            <span>{m.label}</span>
                            <span className="text-xs text-muted-foreground">{m.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Model Info Badge */}
                {provider === 'kieai' && getCurrentModelInfo() && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {getCurrentModelInfo()?.requiresImage && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
                        Bild erforderlich
                      </span>
                    )}
                    {getCurrentModelInfo()?.maxImages && getCurrentModelInfo()!.maxImages! > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500">
                        Max {getCurrentModelInfo()?.maxImages} Bilder
                      </span>
                    )}
                    {getCurrentModelInfo()?.supportsResolution && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                        1K/2K/4K
                      </span>
                    )}
                    {getCurrentModelInfo()?.supportsUpscaleFactor && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                        1x-8x Upscale
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Aspect Ratio - Third (Dynamic based on model, hidden for upscale) */}
              {getCurrentModelInfo()?.type !== 'upscale' && aspectRatios.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-foreground">
                    3. Seitenverhältnis
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({aspectRatios.length} unterstützt)
                    </span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {aspectRatios.slice(0, 8).map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value as typeof aspectRatio)}
                        className={`flex flex-col items-center rounded-xl border p-2.5 transition-all duration-200 ${
                          aspectRatio === ar.value
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                            : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="font-medium text-sm">{ar.label}</span>
                        <span className="text-[10px] opacity-70">{ar.description}</span>
                      </button>
                    ))}
                  </div>
                  {/* Show more ratios in a second row if available */}
                  {aspectRatios.length > 8 && (
                    <div className="grid grid-cols-4 gap-2">
                      {aspectRatios.slice(8).map((ar) => (
                        <button
                          key={ar.value}
                          onClick={() => setAspectRatio(ar.value as typeof aspectRatio)}
                          className={`flex flex-col items-center rounded-xl border p-2.5 transition-all duration-200 ${
                            aspectRatio === ar.value
                              ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                              : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                          }`}
                        >
                          <span className="font-medium text-sm">{ar.label}</span>
                          <span className="text-[10px] opacity-70">{ar.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            className="w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0" 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || (provider === 'kieai' && getCurrentModelInfo()?.requiresImage && !referenceImage)}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generiere...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {getCurrentModelInfo()?.type === 'upscale' ? 'Bild hochskalieren' : 
                 getCurrentModelInfo()?.type === 'image-to-image' ? 'Bild bearbeiten' : 
                 'Bild generieren'}
              </>
            )}
          </Button>

          {/* Error when image required */}
          {provider === 'kieai' && getCurrentModelInfo()?.requiresImage && !referenceImage && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-500">
              ⚠️ Dieses Modell benötigt ein Eingabebild. Bitte lade ein Bild hoch oder wähle eines aus der Galerie.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-xl sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Vorschau
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewFileInputRef.current?.click()}
                  disabled={isUploadingRef}
                  className="border-border/50 hover:bg-secondary/50"
                >
                  {isUploadingRef ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Hochladen</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGalleryPicker(true)}
                  className="border-border/50 hover:bg-secondary/50"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Meine Bilder</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square rounded-xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Generiere dein Bild...
                  </p>
                </div>
              ) : isAnalyzing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Brain className="w-12 h-12 text-primary animate-pulse mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Analysiere Bild mit KI...
                  </p>
                </div>
              ) : generatedImage ? (
                <div 
                  className="relative w-full h-full group cursor-pointer"
                  onClick={() => setShowImagePreview(true)}
                >
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="h-full w-full object-cover"
                  />
                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ) : referenceImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={referenceImage.fileUrl}
                    alt="Reference image"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70"
                      onClick={() => {
                        setReferenceImage(null)
                        setImageAnalysis(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageAnalysis && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Brain className="h-3 w-3 text-primary" />
                        <span>KI-Analyse abgeschlossen</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors w-full h-full"
                  onClick={() => previewFileInputRef.current?.click()}
                >
                  <ImagePlus className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-sm">Klicke zum Hochladen</p>
                  <p className="text-xs mt-1">oder wähle aus Meine Bilder</p>
                </div>
              )}
            </div>

            {/* Image Analysis Info */}
            {imageAnalysis && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Brain className="h-4 w-4" />
                  KI-Analyse (Gemini 2.5 Flash)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {imageAnalysis.productName && (
                    <div>
                      <span className="text-muted-foreground">Produkt:</span>
                      <span className="ml-1 text-foreground">{imageAnalysis.productName}</span>
                    </div>
                  )}
                  {imageAnalysis.productType && (
                    <div>
                      <span className="text-muted-foreground">Typ:</span>
                      <span className="ml-1 text-foreground">{imageAnalysis.productType}</span>
                    </div>
                  )}
                  {imageAnalysis.mood && (
                    <div>
                      <span className="text-muted-foreground">Stimmung:</span>
                      <span className="ml-1 text-foreground">{imageAnalysis.mood}</span>
                    </div>
                  )}
                  {imageAnalysis.colors && imageAnalysis.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Farben:</span>
                      {imageAnalysis.colors.slice(0, 4).map((color, i) => (
                        <div 
                          key={i} 
                          className="w-4 h-4 rounded-full border border-white/20" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {imageAnalysis.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {imageAnalysis.description}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => {
                    if (selectedPreset) {
                      const preset = presets.find(p => p.id === selectedPreset)
                      if (preset) {
                        let filledPrompt = preset.promptTemplate
                        // Replace placeholders with analysis data
                        if (imageAnalysis.productName) {
                          filledPrompt = filledPrompt.replace(/\[PRODUKTNAME\]/g, imageAnalysis.productName)
                        }
                        if (imageAnalysis.colors && imageAnalysis.colors.length > 0) {
                          filledPrompt = filledPrompt.replace(/\[MARKENFARBE\]/g, imageAnalysis.colors[0])
                          filledPrompt = filledPrompt.replace(/\[HEX-FARBEN\]/g, imageAnalysis.colors.join(', '))
                        }
                        if (imageAnalysis.mood) {
                          filledPrompt = filledPrompt.replace(/\[STIMMUNG\]/g, imageAnalysis.mood)
                        }
                        if (imageAnalysis.suggestedStyle) {
                          filledPrompt = filledPrompt.replace(/\[STIL\]/g, imageAnalysis.suggestedStyle)
                        }
                        setPrompt(filledPrompt)
                      }
                    } else {
                      // No preset selected - create a prompt from analysis
                      const parts = []
                      if (imageAnalysis.productName) {
                        parts.push(`Produkt: ${imageAnalysis.productName}`)
                      }
                      if (imageAnalysis.mood) {
                        parts.push(`Stimmung: ${imageAnalysis.mood}`)
                      }
                      if (imageAnalysis.suggestedStyle) {
                        parts.push(`Stil: ${imageAnalysis.suggestedStyle}`)
                      }
                      if (imageAnalysis.colors && imageAnalysis.colors.length > 0) {
                        parts.push(`Farben: ${imageAnalysis.colors.join(', ')}`)
                      }
                      if (parts.length > 0) {
                        setPrompt(parts.join('. ') + '.')
                      }
                    }
                  }}
                  disabled={!imageAnalysis.productName && !imageAnalysis.mood && !imageAnalysis.colors?.length}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  {selectedPreset ? 'Analyse in Preset übernehmen' : 'Analyse als Prompt verwenden'}
                </Button>
              </div>
            )}

            {generatedImage && (
              <div className="space-y-2">
                {/* Save Success Message */}
                {savedSuccess && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Bild wurde in &quot;Meine Bilder&quot; gespeichert!
                  </div>
                )}
                
                {/* Action Buttons Row 1: Save & Preview */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className={`flex-1 border-border/50 hover:bg-secondary/50 ${savedSuccess ? "border-green-500/50 text-green-500" : ""}`}
                    onClick={handleSaveToGallery}
                    disabled={isSaving || savedSuccess}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : savedSuccess ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {savedSuccess ? "Gespeichert" : "Speichern"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border/50 hover:bg-secondary/50"
                    onClick={() => setShowImagePreview(true)}
                  >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Vorschau
                  </Button>
                </div>
                
                {/* Action Buttons Row 2: Download & Regenerate */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border/50 hover:bg-secondary/50"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border/50 hover:bg-secondary/50"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Neu generieren
                  </Button>
                </div>
              </div>
            )}
            
            {/* Instagram Content Section */}
            {generatedImage && (
              <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    Instagram Content
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generiere Caption & Hashtags basierend auf deinem Marken-Kontext
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generate Button */}
                  {!instagramCaption && !isGeneratingCaption && (
                    <Button
                      onClick={generateInstagramContent}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                      disabled={isGeneratingCaption}
                    >
                      <Instagram className="mr-2 h-4 w-4" />
                      Für Instagram analysieren
                    </Button>
                  )}
                  
                  {/* Loading State */}
                  {isGeneratingCaption && (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative">
                        <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                        <Instagram className="h-4 w-4 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Generiere Instagram-Content...
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Mit deinem Marken-Kontext
                      </p>
                    </div>
                  )}
                  
                  {/* Generated Content */}
                  {instagramCaption && !isGeneratingCaption && (
                    <div className="space-y-4">
                      {/* Caption */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-pink-500" />
                            Caption
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCaptionEditMode(!captionEditMode)}
                              className="h-7 px-2 text-xs"
                              title={captionEditMode ? "Bearbeitung beenden" : "Bearbeiten"}
                            >
                              <Pencil className={`h-3.5 w-3.5 ${captionEditMode ? 'text-pink-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCopyCaption}
                              className="h-7 px-2 text-xs"
                            >
                              {captionCopied ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Editable or Static Caption */}
                        {captionEditMode ? (
                          <Textarea
                            value={instagramCaption}
                            onChange={(e) => {
                              setInstagramCaption(e.target.value)
                              setInstagramFullText(e.target.value + "\n\n" + instagramHashtags.join(" "))
                            }}
                            className="min-h-[120px] bg-secondary/30 border-pink-500/30 focus:border-pink-500/50 text-sm"
                            placeholder="Caption bearbeiten..."
                          />
                        ) : (
                          <div className="bg-secondary/30 rounded-lg p-3 text-sm whitespace-pre-wrap border border-border/30">
                            {instagramCaption}
                          </div>
                        )}
                        
                        {/* AI Refine Tools */}
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Wand2 className="h-3 w-3" />
                            KI-Werkzeuge
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("shorten")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Minimize2 className="h-3 w-3 mr-1" />
                              Kürzer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("lengthen")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              Länger
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("more_emojis")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Smile className="h-3 w-3 mr-1" />
                              +Emoji
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("more_cta")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Megaphone className="h-3 w-3 mr-1" />
                              +CTA
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("more_emotion")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Emotionaler
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("professional")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <Briefcase className="h-3 w-3 mr-1" />
                              Professioneller
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("casual")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Lockerer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("question")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <HelpCircle className="h-3 w-3 mr-1" />
                              Als Frage
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refineCaption("story")}
                              disabled={isRefiningCaption}
                              className="h-7 text-xs px-2 border-border/50 hover:bg-pink-500/10 hover:border-pink-500/30"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              Story
                            </Button>
                          </div>
                          {isRefiningCaption && (
                            <div className="flex items-center gap-2 text-xs text-pink-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Bearbeite Caption...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Hashtags */}
                      {instagramHashtags.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 text-purple-500" />
                              Hashtags ({instagramHashtags.length})
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCopyHashtags}
                              className="h-7 px-2 text-xs"
                            >
                              {hashtagsCopied ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground border border-border/30 flex flex-wrap gap-1">
                            {instagramHashtags.map((tag, i) => (
                              <span 
                                key={i} 
                                className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Copy Full Text Button */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyFullText}
                          className="flex-1 border-pink-500/30 hover:bg-pink-500/10"
                        >
                          {fullTextCopied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              Kopiert!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Alles kopieren
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateInstagramContent}
                          className="border-border/50 hover:bg-secondary/50"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Neu
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Hidden file input for preview upload */}
            <input
              ref={previewFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => e.target.files && handlePreviewUpload(e.target.files)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Gallery Picker Dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bild aus Galerie wählen</DialogTitle>
            <DialogDescription>
              Wähle ein Bild - es wird automatisch mit KI analysiert
            </DialogDescription>
          </DialogHeader>
          
          {galleryImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Keine Bilder vorhanden</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setShowGalleryPicker(false)
                  previewFileInputRef.current?.click()
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Bild hochladen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((image) => (
                <button
                  key={image.id}
                  onClick={async () => {
                    setShowGalleryPicker(false)
                    await handleImageSelected(image)
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/50 hover:border-primary transition-all"
                >
                  <img
                    src={image.thumbnailUrl || image.fileUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Check className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white truncate">{image.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generated Image Preview Dialog */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Bildvorschau</DialogTitle>
          <div className="relative bg-black">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowImagePreview(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Image */}
            {generatedImage && (
              <img
                src={generatedImage}
                alt="Generiertes Bild - Vollansicht"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            
            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                {/* Image Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>KI-generiertes Bild</span>
                    <span className="text-white/40">•</span>
                    <span>{provider === 'kieai' ? kieModel : geminiModel}</span>
                    <span className="text-white/40">•</span>
                    <span>{aspectRatio}</span>
                  </div>
                  {prompt && (
                    <p className="text-white/60 text-xs line-clamp-2 max-w-xl">
                      {prompt.substring(0, 150)}{prompt.length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveToGallery}
                    disabled={isSaving || savedSuccess}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : savedSuccess ? (
                      <Check className="mr-2 h-4 w-4 text-green-400" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {savedSuccess ? "Gespeichert!" : "Speichern"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (generatedImage) {
                        window.open(generatedImage, '_blank')
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Neues Tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

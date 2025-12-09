"use client"

import { useState, useEffect, useRef } from "react"
import {
  Image,
  Video,
  FileText,
  Calendar,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Edit3,
  Copy,
  Check,
  X,
  AlertCircle,
  Instagram,
  Info,
  Zap,
  Clock,
  DollarSign,
  Upload,
  ImageIcon,
  Trash2,
  ZoomIn,
  Maximize2,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SeasonalIdea } from "./IdeaCard"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// ============ MODEL DEFINITIONS ============

// Supported aspect ratios per model (from docs)
const ASPECT_RATIOS = {
  // Full list for most KIE.AI models
  full: ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "4:5", "5:4", "21:9"],
  // Seedream 4.5 specific
  seedream: ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2", "21:9"],
  // Flux 2 specific  
  flux: ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2"],
  // Gemini Direct - no specific aspect ratio control, generates based on prompt
  geminiDirect: ["1:1", "4:3", "3:4", "16:9", "9:16"],
} as const

// Quality options per model
const QUALITY_OPTIONS = {
  // Nano Banana Pro: 1K, 2K, 4K
  nanaBananaPro: [
    { value: "1K", label: "Standard (1K)" },
    { value: "2K", label: "High (2K)" },
    { value: "4K", label: "Ultra HD (4K)" },
  ],
  // Seedream 4.5: basic (2K), high (4K)
  seedream: [
    { value: "basic", label: "Standard (2K)" },
    { value: "high", label: "Hoch (4K)" },
  ],
  // Flux 2: 1K, 2K
  flux: [
    { value: "1K", label: "Standard (1K)" },
    { value: "2K", label: "High (2K)" },
  ],
  // Nano Banana: no quality option (fixed)
  nanaBanana: [],
  // Gemini Direct: no quality option
  geminiDirect: [],
} as const

// Image Models with info and supported options
const IMAGE_MODELS = {
  // ========== TEXT-TO-IMAGE MODELS ==========
  // KIE.AI Models
  "nano-banana-pro": {
    name: "Nano Banana Pro",
    provider: "KIE.AI (Google)",
    description: "Gemini 3.0 Pro Image - Beste Qualität, 4K Support, bis zu 8 Referenzbilder",
    features: ["4K Ultra HD", "Multi-Referenz", "Beste Text-Rendering"],
    price: "~$0.09-0.12",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.full,
    qualityOptions: QUALITY_OPTIONS.nanaBananaPro,
    defaultQuality: "2K",
    supportsReference: true, // Can use reference images
    isImageToImage: false,
  },
  "nano-banana": {
    name: "Nano Banana",
    provider: "KIE.AI (Google)",
    description: "Gemini 2.5 Flash Image - Schnell & günstig, Text-to-Image",
    features: ["Schnell", "Günstig", "Gut für einfache Bilder"],
    price: "~$0.02",
    speed: "Schnell",
    quality: "⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.full,
    qualityOptions: QUALITY_OPTIONS.nanaBanana,
    defaultQuality: null,
    supportsReference: false,
    isImageToImage: false,
  },
  "seedream-4-5-text-to-image": {
    name: "Seedream 4.5",
    provider: "KIE.AI (ByteDance)",
    description: "Neuestes Seedream Modell - Fotorealismus, kreative Styles",
    features: ["Fotorealistisch", "2K/4K", "Kreative Styles"],
    price: "~$0.02-0.04",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.seedream,
    qualityOptions: QUALITY_OPTIONS.seedream,
    defaultQuality: "basic",
    supportsReference: false,
    isImageToImage: false,
  },
  "flux-2-pro-text-to-image": {
    name: "Flux 2 Pro",
    provider: "KIE.AI (Black Forest)",
    description: "Black Forest Labs - Exzellentes Text-Rendering, hohe Konsistenz",
    features: ["Text-Rendering", "Multi-Referenz", "4MP"],
    price: "~$0.025-0.035",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.flux,
    qualityOptions: QUALITY_OPTIONS.flux,
    defaultQuality: "1K",
    supportsReference: false,
    isImageToImage: false,
  },
  // Gemini Direct Models
  "gemini-2.5-flash-image": {
    name: "Gemini 2.5 Flash",
    provider: "Google Direct",
    description: "Direkte Gemini API - Schnelle Bildgenerierung mit natürlicher Sprache",
    features: ["Direkte API", "Schnell", "Konversationell"],
    price: "Nach Verbrauch",
    speed: "Sehr schnell",
    quality: "⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.geminiDirect,
    qualityOptions: QUALITY_OPTIONS.geminiDirect,
    defaultQuality: null,
    supportsReference: true, // Gemini supports image input
    isImageToImage: false,
  },
  "gemini-3-pro-image-preview": {
    name: "Gemini 3 Pro Preview",
    provider: "Google Direct",
    description: "Direkte Gemini API - Höchste Qualität, kann länger dauern",
    features: ["Höchste Qualität", "4K", "Preview"],
    price: "Nach Verbrauch",
    speed: "Langsam",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.geminiDirect,
    qualityOptions: QUALITY_OPTIONS.geminiDirect,
    defaultQuality: null,
    supportsReference: true, // Gemini supports image input
    isImageToImage: false,
  },
  
  // ========== IMAGE-TO-IMAGE MODELS ==========
  "seedream-4-5-edit": {
    name: "Seedream 4.5 Edit",
    provider: "KIE.AI (ByteDance)",
    description: "Bild bearbeiten mit Seedream 4.5 - Änderungen basierend auf Referenzbild",
    features: ["Bild-Bearbeitung", "Style Transfer", "2K/4K"],
    price: "~$0.02-0.04",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.seedream,
    qualityOptions: QUALITY_OPTIONS.seedream,
    defaultQuality: "basic",
    supportsReference: true,
    isImageToImage: true, // Requires reference image
  },
  "flux-2-pro-image-to-image": {
    name: "Flux 2 Pro I2I",
    provider: "KIE.AI (Black Forest)",
    description: "Bild-zu-Bild mit Flux 2 - Transformiere deine Bilder",
    features: ["Multi-Referenz", "Style Transfer", "Konsistent"],
    price: "~$0.025-0.035",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    aspectRatios: ASPECT_RATIOS.flux,
    qualityOptions: QUALITY_OPTIONS.flux,
    defaultQuality: "1K",
    supportsReference: true,
    isImageToImage: true, // Requires reference image
  },
} as const

// Models that require a reference image (Image-to-Image)
const IMAGE_TO_IMAGE_MODELS: ImageModelKey[] = ["seedream-4-5-edit", "flux-2-pro-image-to-image"]

// Models that support optional reference images
const SUPPORTS_REFERENCE_MODELS: ImageModelKey[] = [
  "nano-banana-pro", 
  "gemini-2.5-flash-image", 
  "gemini-3-pro-image-preview",
  "seedream-4-5-edit",
  "flux-2-pro-image-to-image"
]

// Video aspect ratio options per model
const VIDEO_ASPECT_RATIOS = {
  // Kling 2.6 supports: 1:1, 16:9, 9:16
  kling: ["1:1", "16:9", "9:16"],
  // Veo 3.1 supports: 16:9, 9:16, Auto
  veo: ["16:9", "9:16"],
  // Gemini Direct - based on prompt
  geminiDirect: ["16:9", "9:16"],
  // Sora 2 supports portrait/landscape
  sora: ["16:9", "9:16"],
  // Wan 2.5 - any aspect
  wan: ["16:9", "9:16"],
  // Seedance - any aspect
  seedance: ["16:9", "9:16"],
  // Grok - any aspect
  grok: ["16:9", "9:16"],
} as const

// Video duration options per model  
const VIDEO_DURATIONS = {
  // Kling 2.6: 5 or 10 seconds
  kling: [
    { value: "5", label: "5 Sekunden" },
    { value: "10", label: "10 Sekunden" },
  ],
  // Veo 3.1: fixed 8 seconds
  veo: [
    { value: "8", label: "8 Sekunden (fest)" },
  ],
  // Gemini Direct: fixed 8 seconds
  geminiDirect: [
    { value: "8", label: "8 Sekunden (fest)" },
  ],
  // Sora 2: 10 or 15 seconds
  sora: [
    { value: "10", label: "10 Sekunden" },
    { value: "15", label: "15 Sekunden" },
  ],
  // Wan 2.5: 5 or 10 seconds
  wan: [
    { value: "5", label: "5 Sekunden" },
    { value: "10", label: "10 Sekunden" },
  ],
  // Seedance: 5 or 10 seconds
  seedance: [
    { value: "5", label: "5 Sekunden" },
    { value: "10", label: "10 Sekunden" },
  ],
  // Grok: varies
  grok: [
    { value: "5", label: "~5 Sekunden" },
  ],
} as const

// Video Models with info and supported options
const VIDEO_MODELS = {
  // ========== KIE.AI TEXT-TO-VIDEO ==========
  "kling-2-6-text-to-video": {
    name: "Kling 2.6 Text-to-Video",
    provider: "KIE.AI (Kuaishou)",
    description: "Text zu Video mit optionalem Sound - 5 oder 10 Sekunden",
    features: ["Sound Support", "5-10 Sek", "Hohe Qualität"],
    price: "~$0.15-0.30",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: false,
    aspectRatios: VIDEO_ASPECT_RATIOS.kling,
    durations: VIDEO_DURATIONS.kling,
    supportsSound: true,
  },
  "veo-3-1-quality": {
    name: "Veo 3.1 Quality",
    provider: "KIE.AI (Google)",
    description: "Google Veo - Höchste Videoqualität, 8 Sekunden, natives Audio",
    features: ["8 Sek", "720p/1080p", "Natives Audio"],
    price: "~$0.20",
    speed: "Langsam",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: false,
    aspectRatios: VIDEO_ASPECT_RATIOS.veo,
    durations: VIDEO_DURATIONS.veo,
    supportsSound: true,
  },
  "veo-3-1-fast": {
    name: "Veo 3.1 Fast",
    provider: "KIE.AI (Google)",
    description: "Google Veo Fast - Schnellere Generierung, gute Qualität",
    features: ["Schnell", "720p", "Natives Audio"],
    price: "~$0.10",
    speed: "Schnell",
    quality: "⭐⭐⭐⭐",
    requiresImage: false,
    aspectRatios: VIDEO_ASPECT_RATIOS.veo,
    durations: VIDEO_DURATIONS.veo,
    supportsSound: true,
  },
  
  // ========== KIE.AI IMAGE-TO-VIDEO ==========
  "kling-2-6-image-to-video": {
    name: "Kling 2.6 Image-to-Video",
    provider: "KIE.AI (Kuaishou)",
    description: "Bild zu Video Animation mit Sound - Belebt deine Bilder",
    features: ["Sound Support", "Bild-Animation", "5-10 Sek"],
    price: "~$0.15-0.30",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.kling,
    durations: VIDEO_DURATIONS.kling,
    supportsSound: true,
  },
  "wan-2-5-image-to-video": {
    name: "Wan 2.5 Image-to-Video",
    provider: "KIE.AI (Alibaba)",
    description: "Alibaba Wan 2.5 - Bild zu Video mit Lippensync & Dialog",
    features: ["Lippensync", "Dialog", "5-10 Sek", "1080p"],
    price: "~$0.10-0.20",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.wan,
    durations: VIDEO_DURATIONS.wan,
    supportsSound: true,
  },
  "sora-2-image-to-video": {
    name: "Sora 2 Image-to-Video",
    provider: "KIE.AI (OpenAI)",
    description: "OpenAI Sora 2 - Hochwertige Bild-Animation mit Sprache",
    features: ["Sprache", "10-15 Sek", "Cinematic"],
    price: "~$0.25-0.40",
    speed: "Langsam",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.sora,
    durations: VIDEO_DURATIONS.sora,
    supportsSound: true,
  },
  "sora-2-pro-storyboard": {
    name: "Sora 2 Pro Storyboard",
    provider: "KIE.AI (OpenAI)",
    description: "Sora 2 Pro - Längere Videos bis 25 Sek, Storyboard-basiert",
    features: ["Storyboard", "10-25 Sek", "Pro Quality"],
    price: "~$0.40-0.80",
    speed: "Langsam",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.sora,
    durations: [
      { value: "10", label: "10 Sekunden" },
      { value: "15", label: "15 Sekunden" },
      { value: "25", label: "25 Sekunden" },
    ],
    supportsSound: false,
  },
  "seedance-v1-pro-fast": {
    name: "Seedance V1 Pro Fast",
    provider: "KIE.AI (ByteDance)",
    description: "ByteDance Seedance - Schnelle Bild-Animation, 720p/1080p",
    features: ["Schnell", "720p/1080p", "5-10 Sek"],
    price: "~$0.08-0.15",
    speed: "Schnell",
    quality: "⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.seedance,
    durations: VIDEO_DURATIONS.seedance,
    supportsSound: false,
  },
  "grok-imagine-image-to-video": {
    name: "Grok Imagine I2V",
    provider: "KIE.AI (xAI)",
    description: "xAI Grok - Kreative Bild-Animation mit verschiedenen Modi",
    features: ["Fun/Normal/Spicy Modi", "Kreativ"],
    price: "~$0.10-0.20",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.grok,
    durations: VIDEO_DURATIONS.grok,
    supportsSound: false,
  },
  
  // ========== KIE.AI VEO 3.1 IMAGE-TO-VIDEO ==========
  "veo-3-1-quality-i2v": {
    name: "Veo 3.1 Quality I2V",
    provider: "KIE.AI (Google)",
    description: "Veo 3.1 Quality - Bild zu Video, 1-2 Bilder (Start/End Frame)",
    features: ["8 Sek", "720p/1080p", "Natives Audio", "Start/End Frame"],
    price: "~$0.20",
    speed: "Langsam",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.veo,
    durations: VIDEO_DURATIONS.veo,
    supportsSound: true,
  },
  "veo-3-1-fast-i2v": {
    name: "Veo 3.1 Fast I2V",
    provider: "KIE.AI (Google)",
    description: "Veo 3.1 Fast - Schnelle Bild-Animation, Reference Images Support",
    features: ["Schnell", "720p", "Natives Audio", "1-3 Referenzbilder"],
    price: "~$0.10",
    speed: "Schnell",
    quality: "⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.veo,
    durations: VIDEO_DURATIONS.veo,
    supportsSound: true,
  },
  
  // ========== GEMINI DIRECT ==========
  "veo-3.1-generate-preview": {
    name: "Veo 3.1 (Gemini Direct)",
    provider: "Google Direct",
    description: "Direkte Veo API via Gemini - 8 Sek HD mit Dialog & Sound",
    features: ["Dialog", "Sound Effects", "8 Sek HD"],
    price: "Nach Verbrauch",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: false,
    aspectRatios: VIDEO_ASPECT_RATIOS.geminiDirect,
    durations: VIDEO_DURATIONS.geminiDirect,
    supportsSound: true,
  },
  "veo-3.1-i2v-preview": {
    name: "Veo 3.1 I2V (Gemini Direct)",
    provider: "Google Direct",
    description: "Direkte Veo API - Bild zu Video mit First/Last Frame Support",
    features: ["Start/End Frame", "8 Sek HD", "Dialog & Sound"],
    price: "Nach Verbrauch",
    speed: "Mittel",
    quality: "⭐⭐⭐⭐⭐",
    requiresImage: true,
    aspectRatios: VIDEO_ASPECT_RATIOS.geminiDirect,
    durations: VIDEO_DURATIONS.geminiDirect,
    supportsSound: true,
  },
} as const

type ImageModelKey = keyof typeof IMAGE_MODELS
type VideoModelKey = keyof typeof VIDEO_MODELS

interface ContentWizardProps {
  idea: SeasonalIdea
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface InstagramAccount {
  id: string
  username: string
  profilePicture?: string
}

type WizardStep = "image" | "video" | "caption" | "schedule" | "complete"

const STEPS: WizardStep[] = ["image", "video", "caption", "schedule", "complete"]

const STEP_CONFIG = {
  image: { icon: Image, label: "Bild", description: "Bild generieren" },
  video: { icon: Video, label: "Video", description: "Video generieren" },
  caption: { icon: FileText, label: "Caption", description: "Caption & Hashtags" },
  schedule: { icon: Calendar, label: "Planen", description: "Termin wählen" },
  complete: { icon: CheckCircle2, label: "Fertig", description: "Zusammenfassung" },
}

// Helper component for model info display
function ModelInfoCard({ model, type }: { model: ImageModelKey | VideoModelKey, type: "image" | "video" }) {
  const modelInfo = type === "image" 
    ? IMAGE_MODELS[model as ImageModelKey] 
    : VIDEO_MODELS[model as VideoModelKey]
  
  if (!modelInfo) return null
  
  return (
    <div className="mt-2 p-3 bg-secondary/30 rounded-lg border border-border/50 text-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-medium text-foreground">{modelInfo.name}</span>
          <span className="text-muted-foreground text-xs ml-2">({modelInfo.provider})</span>
        </div>
        <span className="text-xs">{modelInfo.quality}</span>
      </div>
      <p className="text-muted-foreground text-xs mb-2">{modelInfo.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {modelInfo.features.map((feature, i) => (
          <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
            {feature}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {modelInfo.price}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {modelInfo.speed}
        </span>
      </div>
    </div>
  )
}

export function ContentWizard({ idea, isOpen, onClose, onComplete }: ContentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("image")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Image state - ensure prompts are never undefined
  const [generateImage, setGenerateImage] = useState(true)
  const [imagePrompt, setImagePrompt] = useState(idea.imagePrompt || "")
  const [imageModel, setImageModel] = useState<ImageModelKey>("nano-banana-pro")
  const [imageAspectRatio, setImageAspectRatio] = useState("1:1")
  const [imageQuality, setImageQuality] = useState("basic")
  const [imageTaskId, setImageTaskId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageGenerating, setImageGenerating] = useState(false)
  
  // Reference image state
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [referenceImageUploading, setReferenceImageUploading] = useState(false)
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; name: string }[]>([])
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  
  // Image preview/zoom state
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
  
  // Video state - ensure prompts are never undefined, fallback to imagePrompt
  const [generateVideo, setGenerateVideo] = useState(idea.contentType === "video")
  const [videoPrompt, setVideoPrompt] = useState(idea.videoPrompt || idea.imagePrompt || "")
  const [videoModel, setVideoModel] = useState<VideoModelKey>("kling-2-6-text-to-video")
  const [videoAspectRatio, setVideoAspectRatio] = useState("9:16")
  const [videoDuration, setVideoDuration] = useState("5")
  const [videoWithSound, setVideoWithSound] = useState(false)
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoGenerating, setVideoGenerating] = useState(false)
  
  // Video reference image state
  const [videoReferenceImageUrl, setVideoReferenceImageUrl] = useState<string | null>(null)
  const [videoReferenceImageUploading, setVideoReferenceImageUploading] = useState(false)
  const [showVideoGalleryPicker, setShowVideoGalleryPicker] = useState(false)
  const videoFileInputRef = useRef<HTMLInputElement>(null)
  
  // Caption state - ensure values are never undefined
  const [caption, setCaption] = useState(idea.captionSuggestion || "")
  const [hashtags, setHashtags] = useState(idea.hashtags?.join(" ") || "")
  const [captionCopied, setCaptionCopied] = useState(false)
  
  // Schedule state
  const [scheduledDate, setScheduledDate] = useState(idea.suggestedDate)
  const [scheduledTime, setScheduledTime] = useState("10:00")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [postType, setPostType] = useState<"FEED" | "REEL" | "STORY">(
    idea.contentType === "video" ? "REEL" : "FEED"
  )
  
  // Result state
  const [projectId, setProjectId] = useState<string | null>(null)
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  
  // Check if model is Gemini Direct (requires different API)
  const isGeminiDirectImage = imageModel.startsWith("gemini-")
  const isGeminiDirectVideo = videoModel === "veo-3.1-generate-preview" || videoModel === "veo-3.1-i2v-preview"

  // Update states when idea prop changes (e.g., when selecting a different idea)
  useEffect(() => {
    console.log("Idea changed:", idea.title, "imagePrompt:", idea.imagePrompt)
    setImagePrompt(idea.imagePrompt || "")
    setVideoPrompt(idea.videoPrompt || idea.imagePrompt || "")
    setCaption(idea.captionSuggestion || "")
    setHashtags(idea.hashtags?.join(" ") || "")
    setScheduledDate(idea.suggestedDate || "")
    setGenerateVideo(idea.contentType === "video")
    setPostType(idea.contentType === "video" ? "REEL" : "FEED")
    // Reset generation states
    setImageUrl(null)
    setVideoUrl(null)
    setImageTaskId(null)
    setVideoTaskId(null)
    setImageGenerating(false)
    setVideoGenerating(false)
    setCurrentStep("image")
  }, [idea])

  // Reset aspect ratio and quality when image model changes
  useEffect(() => {
    const modelConfig = IMAGE_MODELS[imageModel]
    const availableRatios = modelConfig.aspectRatios as readonly string[]
    // Reset aspect ratio to first available option if current is not supported
    if (!availableRatios.includes(imageAspectRatio)) {
      setImageAspectRatio(availableRatios[0])
    }
    // Reset quality to default for the model
    if (modelConfig.defaultQuality) {
      setImageQuality(modelConfig.defaultQuality)
    }
  }, [imageModel])

  // Reset aspect ratio and duration when video model changes
  useEffect(() => {
    const modelConfig = VIDEO_MODELS[videoModel]
    const availableRatios = modelConfig.aspectRatios as readonly string[]
    // Reset aspect ratio to first available option if current is not supported
    if (!availableRatios.includes(videoAspectRatio)) {
      setVideoAspectRatio(availableRatios[0])
    }
    // Reset duration to first available option
    const durations = modelConfig.durations as readonly { value: string; label: string }[]
    if (durations.length > 0 && durations[0]) {
      setVideoDuration(durations[0].value)
    }
  }, [videoModel])

  // Fetch Instagram accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/instagram/accounts")
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts || [])
          if (data.accounts?.length > 0) {
            setSelectedAccountId(data.accounts[0].id)
          }
        }
      } catch (err) {
        console.error("Error fetching accounts:", err)
      }
    }
    fetchAccounts()
  }, [])

  // Fetch gallery images for reference selection
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        // Use the same API that the Gallery page uses
        const response = await fetch("/api/upload/image")
        if (response.ok) {
          const data = await response.json()
          console.log("Gallery API response:", data)
          // The upload/image API returns images with fileUrl (not imageUrl)
          const images = data.images?.map((p: { id: string; fileUrl?: string; title?: string }) => ({
            id: p.id,
            url: p.fileUrl,
            name: p.title || "Bild",
          })).filter((img: { url?: string }) => img.url) || []
          console.log("Filtered gallery images:", images)
          setGalleryImages(images)
        }
      } catch (err) {
        console.error("Error fetching gallery images:", err)
      }
    }
    fetchGalleryImages()
  }, [])

  // Auto-switch to Image-to-Image model when reference image is added
  useEffect(() => {
    if (referenceImageUrl && !IMAGE_MODELS[imageModel].supportsReference) {
      // Switch to a model that supports references
      setImageModel("nano-banana-pro")
    }
  }, [referenceImageUrl, imageModel])

  // Poll for image/video task status
  useEffect(() => {
    const pollTaskStatus = async (taskId: string, type: "image" | "video") => {
      try {
        const params = new URLSearchParams({
          taskId,
          type,
        })
        
        const response = await fetch(`/api/generate/content-bundle?${params.toString()}`)
        const data = await response.json()
        
        if (data.state === "success" && data.resultUrl) {
          if (type === "image") {
            setImageUrl(data.resultUrl)
            setImageGenerating(false)
          } else {
            setVideoUrl(data.resultUrl)
            setVideoGenerating(false)
          }
        } else if (data.state === "fail") {
          setError(data.error || `${type === "image" ? "Bild" : "Video"}-Generierung fehlgeschlagen`)
          if (type === "image") setImageGenerating(false)
          else setVideoGenerating(false)
        } else {
          // Still processing, poll again
          setTimeout(() => pollTaskStatus(taskId, type), 3000)
        }
      } catch (err) {
        console.error("Error polling task status:", err)
      }
    }

    if (imageTaskId && imageGenerating) {
      pollTaskStatus(imageTaskId, "image")
    }
    if (videoTaskId && videoGenerating) {
      pollTaskStatus(videoTaskId, "video")
    }
  }, [imageTaskId, videoTaskId, imageGenerating, videoGenerating])

  const currentStepIndex = STEPS.indexOf(currentStep)
  const stepConfig = STEP_CONFIG[currentStep]
  const StepIcon = stepConfig.icon

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  // Handle reference image upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setReferenceImageUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()
      // API returns { success: true, project: { fileUrl: ... } }
      const uploadedUrl = data.project?.fileUrl || data.url || data.fileUrl
      console.log("Upload response:", data, "Using URL:", uploadedUrl)
      setReferenceImageUrl(uploadedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setReferenceImageUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle gallery image selection
  const handleGallerySelect = (imageUrl: string) => {
    setReferenceImageUrl(imageUrl)
    setShowGalleryPicker(false)
  }

  // Clear reference image
  const clearReferenceImage = () => {
    setReferenceImageUrl(null)
    // If current model requires reference, switch to text-to-image model
    if (IMAGE_MODELS[imageModel].isImageToImage) {
      setImageModel("nano-banana-pro")
    }
  }

  // Get available models based on whether reference image is selected
  const getAvailableImageModels = () => {
    if (referenceImageUrl) {
      // Show only models that support reference images
      return Object.entries(IMAGE_MODELS).filter(
        ([_, config]) => config.supportsReference
      ) as [ImageModelKey, typeof IMAGE_MODELS[ImageModelKey]][]
    }
    // Show all non-image-to-image models (those that don't require reference)
    return Object.entries(IMAGE_MODELS).filter(
      ([_, config]) => !config.isImageToImage
    ) as [ImageModelKey, typeof IMAGE_MODELS[ImageModelKey]][]
  }

  // Handle image zoom
  const handleImageZoom = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl)
    setShowImageZoom(true)
  }

  // Handle video reference image upload
  const handleVideoFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setVideoReferenceImageUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()
      // API returns { success: true, project: { fileUrl: ... } }
      const uploadedUrl = data.project?.fileUrl || data.url || data.fileUrl
      console.log("Video upload response:", data, "Using URL:", uploadedUrl)
      setVideoReferenceImageUrl(uploadedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setVideoReferenceImageUploading(false)
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = ""
      }
    }
  }

  // Handle video gallery image selection
  const handleVideoGallerySelect = (imageUrl: string) => {
    setVideoReferenceImageUrl(imageUrl)
    setShowVideoGalleryPicker(false)
  }

  // Clear video reference image
  const clearVideoReferenceImage = () => {
    setVideoReferenceImageUrl(null)
    // If current model requires image, switch to text-to-video
    if (VIDEO_MODELS[videoModel].requiresImage) {
      setVideoModel("kling-2-6-text-to-video")
    }
  }

  // Get available video models based on whether reference image is selected
  const getAvailableVideoModels = () => {
    if (videoReferenceImageUrl) {
      // Show only models that support/require images (Image-to-Video)
      return Object.entries(VIDEO_MODELS).filter(
        ([_, config]) => config.requiresImage
      ) as [VideoModelKey, typeof VIDEO_MODELS[VideoModelKey]][]
    }
    // Show only text-to-video models
    return Object.entries(VIDEO_MODELS).filter(
      ([_, config]) => !config.requiresImage
    ) as [VideoModelKey, typeof VIDEO_MODELS[VideoModelKey]][]
  }

  // Auto-switch video model when reference image is added/removed
  useEffect(() => {
    if (videoReferenceImageUrl && !VIDEO_MODELS[videoModel].requiresImage) {
      // Switch to image-to-video model
      setVideoModel("kling-2-6-image-to-video")
    } else if (!videoReferenceImageUrl && VIDEO_MODELS[videoModel].requiresImage) {
      // Switch to text-to-video model
      setVideoModel("kling-2-6-text-to-video")
    }
  }, [videoReferenceImageUrl])

  const handleGenerateImage = async () => {
    setImageGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate/content-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          contentType: idea.contentType,
          imagePrompt,
          generateImage: true,
          generateVideo: false,
          imageModel,
          imageAspectRatio,
          imageQuality,
          referenceImageUrl, // Include reference image if provided
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Bildgenerierung")
      }

      // Handle both sync (Gemini Direct) and async (KIE.AI) responses
      if (data.imageUrl) {
        // Synchronous response (Gemini Direct)
        setImageUrl(data.imageUrl)
        setImageGenerating(false)
        setProjectId(data.projectId)
      } else if (data.imageTaskId) {
        // Asynchronous response (KIE.AI) - polling will handle completion
        setImageTaskId(data.imageTaskId)
        setProjectId(data.projectId)
      } else {
        throw new Error("Keine Bild-Daten erhalten")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
      setImageGenerating(false)
    }
  }

  const handleGenerateVideo = async () => {
    setVideoGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate/content-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          contentType: "video",
          videoPrompt,
          generateImage: false,
          generateVideo: true,
          videoModel,
          videoAspectRatio,
          videoDuration,
          videoWithSound,
          videoReferenceImageUrl, // Include video reference image if provided
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Videogenerierung")
      }

      if (data.videoTaskId) {
        setVideoTaskId(data.videoTaskId)
        if (!projectId) setProjectId(data.projectId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
      setVideoGenerating(false)
    }
  }

  const handleSchedule = async () => {
    setLoading(true)
    setError(null)

    try {
      // Combine date and time
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`)

      const response = await fetch("/api/generate/content-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          contentType: idea.contentType,
          caption,
          hashtags: hashtags.split(/\s+/).filter(h => h.startsWith("#")),
          generateImage: false,
          generateVideo: false,
          scheduledAt: scheduledAt.toISOString(),
          instagramAccountId: selectedAccountId,
          postType,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Planen")
      }

      setScheduleId(data.scheduleId)
      setCurrentStep("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }

  const copyCaption = () => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`)
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StepIcon className="h-5 w-5 text-primary" />
            {stepConfig.label}
          </DialogTitle>
          <DialogDescription>
            {stepConfig.description} für &quot;{idea.title}&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/20 rounded-lg">
          {STEPS.slice(0, -1).map((step, index) => {
            const config = STEP_CONFIG[step]
            const Icon = config.icon
            const isActive = step === currentStep
            const isCompleted = index < currentStepIndex
            
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-green-500/20 text-green-500"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">{config.label}</span>
                </div>
                {index < STEPS.length - 2 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/30" />
                )}
              </div>
            )
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Image Step */}
          {currentStep === "image" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Bild generieren?</Label>
                <Switch
                  checked={generateImage}
                  onCheckedChange={setGenerateImage}
                />
              </div>

              {generateImage && (
                <>
                  {/* Reference Image Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Referenzbild (optional)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Verwende ein bestehendes Bild als Vorlage. Bei Auswahl werden nur Image-to-Image Modelle angezeigt.
                    </p>
                    
                    {referenceImageUrl ? (
                      <div className="relative">
                        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border">
                          <div className="relative w-20 h-20 rounded-md overflow-hidden border flex-shrink-0">
                            <img
                              src={referenceImageUrl}
                              alt="Reference"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleImageZoom(referenceImageUrl)}
                              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ZoomIn className="h-5 w-5 text-white" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Referenzbild ausgewählt</p>
                            <p className="text-xs text-muted-foreground">
                              Modelle werden auf Image-to-Image gefiltert
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearReferenceImage}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={referenceImageUploading}
                          className="flex-1"
                        >
                          {referenceImageUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Hochladen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGalleryPicker(true)}
                          className="flex-1"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Aus Galerie
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Bild-Prompt</Label>
                    <Textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Modell
                      <Info className="h-3 w-3 text-muted-foreground" />
                      {referenceImageUrl && (
                        <span className="text-xs text-primary">(Nur Image-to-Image)</span>
                      )}
                    </Label>
                    <Select value={imageModel} onValueChange={(v) => setImageModel(v as ImageModelKey)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {!referenceImageUrl && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">KIE.AI Text-to-Image</div>
                            <SelectItem value="nano-banana-pro">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                Nano Banana Pro (Gemini 3)
                              </div>
                            </SelectItem>
                            <SelectItem value="nano-banana">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-green-500" />
                                Nano Banana (Gemini 2.5 Flash)
                              </div>
                            </SelectItem>
                            <SelectItem value="seedream-4-5-text-to-image">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                Seedream 4.5 (ByteDance)
                              </div>
                            </SelectItem>
                            <SelectItem value="flux-2-pro-text-to-image">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                Flux 2 Pro (Black Forest)
                              </div>
                            </SelectItem>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Google Direct</div>
                            <SelectItem value="gemini-2.5-flash-image">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-blue-400" />
                                Gemini 2.5 Flash (Schnell)
                              </div>
                            </SelectItem>
                            <SelectItem value="gemini-3-pro-image-preview">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-600" />
                                Gemini 3 Pro Preview (Beste)
                              </div>
                            </SelectItem>
                          </>
                        )}
                        {referenceImageUrl && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Image-to-Image Modelle</div>
                            <SelectItem value="nano-banana-pro">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                Nano Banana Pro (Referenz-Support)
                              </div>
                            </SelectItem>
                            <SelectItem value="seedream-4-5-edit">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                Seedream 4.5 Edit (ByteDance)
                              </div>
                            </SelectItem>
                            <SelectItem value="flux-2-pro-image-to-image">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                Flux 2 Pro I2I (Black Forest)
                              </div>
                            </SelectItem>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Google Direct</div>
                            <SelectItem value="gemini-2.5-flash-image">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-blue-400" />
                                Gemini 2.5 Flash (Referenz-Support)
                              </div>
                            </SelectItem>
                            <SelectItem value="gemini-3-pro-image-preview">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-600" />
                                Gemini 3 Pro Preview (Referenz-Support)
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <ModelInfoCard model={imageModel} type="image" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Aspect Ratio - Dynamic based on model */}
                    <div className="space-y-2">
                      <Label>Seitenverhältnis</Label>
                      <Select 
                        value={imageAspectRatio} 
                        onValueChange={setImageAspectRatio}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_MODELS[imageModel].aspectRatios.map((ratio) => (
                            <SelectItem key={ratio} value={ratio}>
                              {ratio === "1:1" && "1:1 (Feed)"}
                              {ratio === "4:5" && "4:5 (Portrait)"}
                              {ratio === "5:4" && "5:4 (Landscape)"}
                              {ratio === "9:16" && "9:16 (Story/Reel)"}
                              {ratio === "16:9" && "16:9 (Landscape)"}
                              {ratio === "3:2" && "3:2 (Classic)"}
                              {ratio === "2:3" && "2:3 (Portrait)"}
                              {ratio === "4:3" && "4:3 (Standard)"}
                              {ratio === "3:4" && "3:4 (Portrait)"}
                              {ratio === "21:9" && "21:9 (Ultra-Wide)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quality - Dynamic based on model, hide if no options */}
                    {IMAGE_MODELS[imageModel].qualityOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Qualität</Label>
                        <Select value={imageQuality} onValueChange={setImageQuality}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {IMAGE_MODELS[imageModel].qualityOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Show info when no quality selection available */}
                    {IMAGE_MODELS[imageModel].qualityOptions.length === 0 && (
                      <div className="space-y-2">
                        <Label>Qualität</Label>
                        <div className="h-10 px-3 py-2 text-sm bg-secondary/50 rounded-md text-muted-foreground flex items-center">
                          {imageModel === "nano-banana" ? "Standard" : "Automatisch"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="mt-4">
                      <Label className="mb-2 block">Generiertes Bild</Label>
                      <div className="relative aspect-square max-w-[300px] rounded-lg overflow-hidden border group">
                        <img
                          src={imageUrl}
                          alt="Generated"
                          className="w-full h-full object-cover"
                        />
                        {/* Zoom overlay */}
                        <button
                          onClick={() => handleImageZoom(imageUrl)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          <div className="flex flex-col items-center text-white">
                            <Maximize2 className="h-8 w-8 mb-1" />
                            <span className="text-sm font-medium">Vergrößern</span>
                          </div>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Klicke auf das Bild zum Vergrößern
                      </p>
                    </div>
                  )}

                  {!imageUrl && (
                    <Button
                      onClick={handleGenerateImage}
                      disabled={imageGenerating || !imagePrompt}
                      className="w-full"
                      variant="gradient"
                    >
                      {imageGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Wird generiert...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Bild generieren
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Video Step */}
          {currentStep === "video" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Video generieren?</Label>
                <Switch
                  checked={generateVideo}
                  onCheckedChange={setGenerateVideo}
                />
              </div>

              {generateVideo && (
                <>
                  {/* Video Reference Image Section */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Referenzbild (optional)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Verwende ein Bild als Startframe. Bei Auswahl werden nur Image-to-Video Modelle angezeigt.
                    </p>
                    
                    {videoReferenceImageUrl ? (
                      <div className="relative">
                        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg border">
                          <div className="relative w-20 h-20 rounded-md overflow-hidden border flex-shrink-0">
                            <img
                              src={videoReferenceImageUrl}
                              alt="Video Reference"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleImageZoom(videoReferenceImageUrl)}
                              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <ZoomIn className="h-5 w-5 text-white" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Startframe ausgewählt</p>
                            <p className="text-xs text-muted-foreground">
                              Modelle werden auf Image-to-Video gefiltert
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearVideoReferenceImage}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={videoFileInputRef}
                          accept="image/*"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={videoReferenceImageUploading}
                          className="flex-1"
                        >
                          {videoReferenceImageUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Hochladen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVideoGalleryPicker(true)}
                          className="flex-1"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Aus Galerie
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Video-Prompt</Label>
                    <Textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Modell
                      <Info className="h-3 w-3 text-muted-foreground" />
                      {videoReferenceImageUrl && (
                        <span className="text-xs text-primary">(Nur Image-to-Video)</span>
                      )}
                    </Label>
                    <Select value={videoModel} onValueChange={(v) => setVideoModel(v as VideoModelKey)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {!videoReferenceImageUrl && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Text-to-Video</div>
                            <SelectItem value="kling-2-6-text-to-video">
                              <div className="flex items-center gap-2">
                                <Video className="h-3 w-3 text-purple-500" />
                                Kling 2.6 Text-to-Video
                              </div>
                            </SelectItem>
                            <SelectItem value="veo-3-1-fast">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-green-500" />
                                Veo 3.1 Fast (Schnell)
                              </div>
                            </SelectItem>
                            <SelectItem value="veo-3-1-quality">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                Veo 3.1 Quality (Beste)
                              </div>
                            </SelectItem>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Google Direct</div>
                            <SelectItem value="veo-3.1-generate-preview">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                Veo 3.1 (Gemini Direct)
                              </div>
                            </SelectItem>
                          </>
                        )}
                        {videoReferenceImageUrl && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Image-to-Video Modelle</div>
                            <SelectItem value="kling-2-6-image-to-video">
                              <div className="flex items-center gap-2">
                                <Video className="h-3 w-3 text-purple-500" />
                                Kling 2.6 I2V (Sound)
                              </div>
                            </SelectItem>
                            <SelectItem value="wan-2-5-image-to-video">
                              <div className="flex items-center gap-2">
                                <Video className="h-3 w-3 text-blue-500" />
                                Wan 2.5 I2V (Lippensync)
                              </div>
                            </SelectItem>
                            <SelectItem value="sora-2-image-to-video">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-orange-500" />
                                Sora 2 I2V (OpenAI)
                              </div>
                            </SelectItem>
                            <SelectItem value="sora-2-pro-storyboard">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-orange-600" />
                                Sora 2 Pro Storyboard
                              </div>
                            </SelectItem>
                            <SelectItem value="seedance-v1-pro-fast">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-green-500" />
                                Seedance V1 Pro Fast
                              </div>
                            </SelectItem>
                            <SelectItem value="grok-imagine-image-to-video">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-red-500" />
                                Grok Imagine I2V (xAI)
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <ModelInfoCard model={videoModel} type="video" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Video Aspect Ratio - Dynamic based on model */}
                    <div className="space-y-2">
                      <Label>Seitenverhältnis</Label>
                      <Select value={videoAspectRatio} onValueChange={setVideoAspectRatio}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VIDEO_MODELS[videoModel].aspectRatios.map((ratio) => (
                            <SelectItem key={ratio} value={ratio}>
                              {ratio === "9:16" && "9:16 (Reel)"}
                              {ratio === "16:9" && "16:9 (Landscape)"}
                              {ratio === "1:1" && "1:1 (Quadrat)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Video Duration - Dynamic based on model */}
                    <div className="space-y-2">
                      <Label>Dauer</Label>
                      {VIDEO_MODELS[videoModel].durations.length > 1 ? (
                        <Select value={videoDuration} onValueChange={setVideoDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VIDEO_MODELS[videoModel].durations.map((dur) => (
                              <SelectItem key={dur.value} value={dur.value}>
                                {dur.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 px-3 py-2 text-sm bg-secondary/50 rounded-md text-muted-foreground flex items-center">
                          {VIDEO_MODELS[videoModel].durations[0]?.label || "8 Sekunden"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sound Toggle - Only show if model supports sound selection */}
                  {VIDEO_MODELS[videoModel].supportsSound && videoModel.includes("kling") && (
                    <div className="flex items-center gap-2">
                      <Switch
                        id="sound"
                        checked={videoWithSound}
                        onCheckedChange={setVideoWithSound}
                      />
                      <Label htmlFor="sound">Mit Sound generieren</Label>
                    </div>
                  )}

                  {/* Info for Veo models with native audio */}
                  {(videoModel.includes("veo") || videoModel === "veo-3.1-generate-preview") && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md">
                      <Info className="h-4 w-4" />
                      <span>Veo 3.1 generiert automatisch natives Audio mit Dialog & Soundeffekten</span>
                    </div>
                  )}

                  {/* Video Preview */}
                  {videoUrl && (
                    <div className="mt-4">
                      <Label className="mb-2 block">Generiertes Video</Label>
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-w-[300px] rounded-lg"
                      />
                    </div>
                  )}

                  {!videoUrl && (
                    <Button
                      onClick={handleGenerateVideo}
                      disabled={videoGenerating || !videoPrompt}
                      className="w-full"
                      variant="gradient"
                    >
                      {videoGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Wird generiert...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Video generieren
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Caption Step */}
          {currentStep === "caption" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Caption</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCaption}
                    className="h-8"
                  >
                    {captionCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  className="resize-none"
                  placeholder="Deine Instagram Caption..."
                />
                <p className="text-xs text-muted-foreground">
                  {caption.length} / 2200 Zeichen
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hashtags</Label>
                <Textarea
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  rows={3}
                  className="resize-none"
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                />
                <p className="text-xs text-muted-foreground">
                  {hashtags.split(/\s+/).filter(h => h.startsWith("#")).length} Hashtags
                </p>
              </div>
            </div>
          )}

          {/* Schedule Step */}
          {currentStep === "schedule" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uhrzeit</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instagram Account</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          @{account.username}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accounts.length === 0 && (
                  <p className="text-xs text-amber-500">
                    Kein Instagram-Account verbunden. Du kannst den Content trotzdem erstellen.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Post-Typ</Label>
                <Select value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEED">Feed Post</SelectItem>
                    <SelectItem value="REEL">Reel</SelectItem>
                    <SelectItem value="STORY">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="flex flex-col items-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Content erstellt!</h3>
              <p className="text-muted-foreground text-center mb-4">
                Dein saisonaler Content wurde erfolgreich erstellt
                {scheduleId && " und geplant"}.
              </p>
              <div className="flex gap-2">
                <Button onClick={onComplete} variant="gradient">
                  Zum Content-Planer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== "complete" && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            {currentStep === "schedule" ? (
              <Button
                variant="gradient"
                onClick={handleSchedule}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                In Kalender eintragen
              </Button>
            ) : (
              <Button onClick={goToNextStep}>
                Weiter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>

      {/* Gallery Picker Dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Bild aus Galerie wählen
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {galleryImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Keine Bilder in der Galerie</p>
                <p className="text-sm">Generiere zuerst einige Bilder</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleGallerySelect(image.url)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors group"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {zoomedImageUrl && (
            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
              <img
                src={zoomedImageUrl}
                alt="Zoomed"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Gallery Picker Dialog */}
      <Dialog open={showVideoGalleryPicker} onOpenChange={setShowVideoGalleryPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Startframe aus Galerie wählen
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {galleryImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Keine Bilder in der Galerie</p>
                <p className="text-sm">Generiere zuerst einige Bilder</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleVideoGallerySelect(image.url)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors group"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

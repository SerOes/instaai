"use client"

import { useState, useEffect, useRef, ChangeEvent, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Settings2,
  Wand2,
  Video,
  Upload,
  Play,
  Clock,
  Check,
  Image as ImageIcon,
  FolderOpen,
  Loader2,
  X,
  Zap,
  Info,
  AlertCircle,
  CheckCircle2
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
import { Progress } from "@/components/ui/progress"

// Video Model type from API
interface VideoModelInfo {
  id: string
  name: string
  description: string
  provider: string
  features: {
    imageToVideo: boolean
    textToVideo: boolean
    tailImage?: boolean
    storyboard?: boolean
    resolution?: string[]
    durations: number[]
    aspectRatios: string[]
  }
  pricing: 'low' | 'medium' | 'high' | 'premium'
}

interface Preset {
  id: string
  name: string
  description?: string
  promptTemplate: string
  style?: string
  category?: string
  duration?: number
  aspectRatio?: string
}

interface ImageAnalysis {
  productName: string
  productDescription: string
  colors: string[]
  mood: string
  style: string
  suggestedAspectRatio: string
  tags: string[]
}

interface GalleryImage {
  id: string
  url: string
  title?: string
  type: string
  createdAt: string
}

// Status polling state
interface GenerationStatus {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
}

export default function GenerateVideoPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Video Models State
  const [videoModels, setVideoModels] = useState<VideoModelInfo[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>("veo-3-1-fast")
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "9:16" | "16:9">("9:16")
  const [duration, setDuration] = useState<number>(5)
  const [resolution, setResolution] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Image Analysis State (for Image-to-Video)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)

  // Gallery Dialog State
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)

  // Get current selected model
  const selectedModel = videoModels.find(m => m.id === selectedModelId)

  // Fetch available video models
  const fetchVideoModels = async () => {
    try {
      setIsLoadingModels(true)
      const response = await fetch("/api/generate/video")
      if (response.ok) {
        const data = await response.json()
        setVideoModels(data.models || [])
      }
    } catch (error) {
      console.error("Error fetching video models:", error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Poll for generation status
  const pollStatus = useCallback(async (taskIdToPoll: string) => {
    try {
      const response = await fetch(`/api/generate/video/status?taskId=${encodeURIComponent(taskIdToPoll)}`)
      if (response.ok) {
        const status: GenerationStatus = await response.json()
        setGenerationStatus(status)

        if (status.status === 'completed' && status.videoUrl) {
          setGeneratedVideo(status.videoUrl)
          setIsGenerating(false)
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else if (status.status === 'failed') {
          setError(status.error || 'Video-Generierung fehlgeschlagen')
          setIsGenerating(false)
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      }
    } catch (error) {
      console.error("Error polling status:", error)
    }
  }, [])

  // Start polling when taskId changes
  useEffect(() => {
    if (taskId && isGenerating) {
      // Initial poll
      pollStatus(taskId)
      
      // Poll every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollStatus(taskId)
      }, 5000)
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [taskId, isGenerating, pollStatus])

  // Analyze source image with Gemini
  const analyzeSourceImage = async (imageUrlToAnalyze: string) => {
    setIsAnalyzing(true)
    setImageAnalysis(null)
    try {
      const response = await fetch("/api/analyze/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrlToAnalyze }),
      })
      
      if (response.ok) {
        const analysis = await response.json()
        setImageAnalysis(analysis)
        
        // Auto-suggest aspect ratio based on analysis
        if (analysis.suggestedAspectRatio) {
          const ratioMap: Record<string, typeof aspectRatio> = {
            "square": "1:1",
            "portrait": "9:16",
            "landscape": "16:9",
          }
          const suggestedRatio = ratioMap[analysis.suggestedAspectRatio.toLowerCase()]
          if (suggestedRatio) setAspectRatio(suggestedRatio)
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle file upload for source image
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setSourceImage(url)
        setImageUrl(url)
        await analyzeSourceImage(url)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  // Fetch gallery images
  const fetchGalleryImages = async () => {
    setIsLoadingGallery(true)
    try {
      const response = await fetch("/api/media?type=IMAGE&limit=50")
      if (response.ok) {
        const data = await response.json()
        setGalleryImages(data.media || [])
      }
    } catch (error) {
      console.error("Error fetching gallery:", error)
    } finally {
      setIsLoadingGallery(false)
    }
  }

  // Handle gallery image selection
  const handleGalleryImageSelect = async (image: GalleryImage) => {
    setSourceImage(image.url)
    setImageUrl(image.url)
    setShowGalleryPicker(false)
    await analyzeSourceImage(image.url)
  }

  // Clear source image
  const clearSourceImage = () => {
    setSourceImage(null)
    setImageUrl("")
    setImageAnalysis(null)
  }

  // Auto-fill prompt with product name from analysis
  const autoFillPromptWithAnalysis = () => {
    if (!imageAnalysis || !selectedPreset) return
    const preset = presets.find(p => p.id === selectedPreset)
    if (!preset) return
    
    let filledPrompt = preset.promptTemplate
    filledPrompt = filledPrompt.replace(/\[PRODUKTNAME\]/gi, imageAnalysis.productName)
    filledPrompt = filledPrompt.replace(/\[PRODUKTBESCHREIBUNG\]/gi, imageAnalysis.productDescription)
    setPrompt(filledPrompt)
  }

  useEffect(() => {
    fetchPresets()
  }, [])

  // Also fetch video models on mount
  useEffect(() => {
    fetchVideoModels()
  }, [])

  const fetchPresets = async () => {
    try {
      const response = await fetch("/api/presets?type=VIDEO&includePublic=true")
      if (response.ok) {
        const data = await response.json()
        setPresets(data.presets)
      }
    } catch (error) {
      console.error("Error fetching presets:", error)
    }
  }

  const handlePresetSelect = (presetId: string | null) => {
    setSelectedPreset(presetId)
    if (presetId) {
      const preset = presets.find(p => p.id === presetId)
      if (preset) {
        // Auto-fill prompt with template
        if (!prompt || prompt === presets.find(p => p.id === selectedPreset)?.promptTemplate) {
          setPrompt(preset.promptTemplate)
        }
        // Auto-set duration if preset has one
        if (preset.duration && selectedModel?.features.durations.includes(preset.duration)) {
          setDuration(preset.duration)
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
    teaser: '🎬 Teaser',
    beforeafter: '🔄 Before/After',
    story: '📱 Story',
    tutorial: '📚 Tutorial',
    brand: '✨ Branding',
    other: '🎥 Sonstige'
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Bitte gib einen Prompt ein")
      return
    }

    setIsGenerating(true)
    setError(null)
    setTaskId(null)
    setGenerationStatus(null)
    setGeneratedVideo(null)

    try {
      const response = await fetch("/api/generate/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageUrl: imageUrl || undefined,
          aspectRatio,
          duration,
          modelId: selectedModelId,
          resolution: resolution || undefined,
          presetId: selectedPreset || undefined,
          projectId: projectId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler bei der Videogenerierung")
        setIsGenerating(false)
        return
      }

      if (data.status === "completed" && data.videoUrl) {
        setGeneratedVideo(data.videoUrl)
        setIsGenerating(false)
      } else if (data.status === "processing" && data.taskId) {
        setTaskId(data.taskId)
        setGenerationStatus({
          status: 'processing',
          progress: 0
        })
        // Polling will be triggered by useEffect
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedVideo) return
    
    try {
      const response = await fetch(generatedVideo)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `instaai-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      console.error("Error downloading video")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Gallery Picker Dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wähle ein Ausgangsbild für Image-to-Video</DialogTitle>
            <DialogDescription>
              Wähle ein Bild aus deiner Galerie, das zum Video animiert werden soll
            </DialogDescription>
          </DialogHeader>
          {isLoadingGallery ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Bilder in deiner Galerie</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => handleGalleryImageSelect(img)}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.title || "Bild"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Video generieren</h1>
        <p className="mt-1 text-muted-foreground">
          Erstelle beeindruckende KI-generierte Videos für Instagram Reels
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Presets - Now First and Prominent */}
          {presets.length > 0 && (
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  1. Wähle ein Preset
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Starte mit einer optimierten Video-Vorlage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from(getPresetCategories()).map(([category, categoryPresets]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {categoryLabels[category] || category}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {categoryPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200 ${
                            selectedPreset === preset.id
                              ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20"
                              : "border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-blue-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              selectedPreset === preset.id ? "text-blue-500" : "text-foreground"
                            }`}>
                              {preset.name}
                            </span>
                            {preset.duration && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {preset.duration}s
                              </span>
                            )}
                          </div>
                          {preset.description && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {preset.description}
                            </span>
                          )}
                          {selectedPreset === preset.id && (
                            <div className="absolute -right-1 -top-1 rounded-full bg-blue-500 p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect(null)}
                  className={`w-full mt-2 ${!selectedPreset ? "text-blue-500" : "text-muted-foreground"}`}
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
                <Wand2 className="h-5 w-5 text-blue-500" />
                2. Passe den Prompt an
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedPreset 
                  ? "Ersetze [PRODUKTNAME] und passe Details an" 
                  : "Beschreibe das Video, das du erstellen möchtest"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-foreground">Videobeschreibung</Label>
                <Textarea
                  id="prompt"
                  placeholder="z.B. A coffee cup with steam rising, gentle camera movement revealing a cozy cafe interior, morning atmosphere with soft golden light..."
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary/20 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 font-mono text-sm"
                />
                {selectedPreset && prompt.includes('[PRODUKTNAME]') && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    ⚠️ Ersetze [PRODUKTNAME] mit deinem echten Produktnamen
                  </p>
                )}
                {imageAnalysis && selectedPreset && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    onClick={autoFillPromptWithAnalysis}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Prompt mit "{imageAnalysis.productName}" füllen
                  </Button>
                )}
              </div>

              {sourceImage && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Ausgangsbild für Image-to-Video ausgewählt
                </div>
              )}

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Settings2 className="h-3 w-3" />
                {showAdvanced ? "Weniger Optionen" : "Erweiterte Optionen (Bild-URL manuell)"}
              </button>

              {showAdvanced && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label htmlFor="imageUrl" className="text-foreground">
                    Bild-URL manuell eingeben <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      placeholder="URL eines Bildes für Image-to-Video"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        if (e.target.value) {
                          setSourceImage(e.target.value)
                        }
                      }}
                      className="bg-secondary/20 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-border/50 hover:bg-secondary/50"
                      onClick={() => imageUrl && analyzeSourceImage(imageUrl)}
                      disabled={!imageUrl || isAnalyzing}
                    >
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oder nutze die Upload-Buttons im Vorschau-Bereich rechts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings2 className="h-5 w-5 text-blue-500" />
                3. Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Model Selection */}
              <div className="space-y-3">
                <Label className="text-foreground">Video-Modell</Label>
                {isLoadingModels ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Lade Modelle...
                  </div>
                ) : (
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger className="bg-secondary/20 border-border/50">
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              model.pricing === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                              model.pricing === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              model.pricing === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {model.pricing}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedModel && (
                  <p className="text-xs text-muted-foreground">
                    {selectedModel.description}
                    {selectedModel.features.textToVideo && selectedModel.features.imageToVideo 
                      ? " • Text & Image-to-Video" 
                      : selectedModel.features.imageToVideo 
                        ? " • Image-to-Video" 
                        : " • Text-to-Video"}
                  </p>
                )}
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <Label className="text-foreground">Seitenverhältnis</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(selectedModel?.features.aspectRatios || ['9:16', '16:9', '1:1']).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar as typeof aspectRatio)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        aspectRatio === ar
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{ar}</span>
                      <span className="text-xs opacity-70">
                        {ar === '9:16' ? 'Reel/Story' : ar === '16:9' ? 'Landscape' : 'Quadrat'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4" />
                  Dauer
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(selectedModel?.features.durations || [5, 10]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        duration === d
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{d}s</span>
                      <span className="text-xs opacity-70">
                        {d <= 5 ? 'Kurz' : d <= 8 ? 'Standard' : 'Lang'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution (if model supports it) */}
              {selectedModel?.features.resolution && (
                <div className="space-y-3">
                  <Label className="text-foreground">Auflösung</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedModel.features.resolution.map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                          resolution === res
                            ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                            : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="font-medium text-sm">{res}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            className="w-full shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0" 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generiere...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Video generieren
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-xl sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Video className="h-5 w-5 text-blue-500" />
                  {sourceImage ? "Ausgangsbild & Vorschau" : "Vorschau"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 hover:bg-secondary/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Hochladen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 hover:bg-secondary/50"
                    onClick={() => {
                      setShowGalleryPicker(true)
                      fetchGalleryImages()
                    }}
                  >
                    <FolderOpen className="h-4 w-4 mr-1" />
                    Meine Bilder
                  </Button>
                </div>
              </div>
              <CardDescription>
                Lade ein Bild hoch für Image-to-Video-Generierung
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Source Image Display */}
              {sourceImage && (
                <div className="mb-4 relative">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={sourceImage}
                      alt="Ausgangsbild"
                      className="w-full h-full object-contain bg-black/20"
                    />
                    <button
                      onClick={clearSourceImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm">Analysiere Bild...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Analysis Results */}
                  {imageAnalysis && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-500">Bild-Analyse</span>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p><strong className="text-foreground">Produkt:</strong> {imageAnalysis.productName}</p>
                        <p><strong className="text-foreground">Stimmung:</strong> {imageAnalysis.mood}</p>
                        <p><strong className="text-foreground">Stil:</strong> {imageAnalysis.style}</p>
                        {imageAnalysis.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {imageAnalysis.tags.slice(0, 5).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-secondary rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedPreset && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                          onClick={autoFillPromptWithAnalysis}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Prompt automatisch ausfüllen
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Video Preview Area */}
              <div 
                className="relative aspect-[9/16] rounded-xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer group"
                onClick={() => !generatedVideo && !isGenerating && fileInputRef.current?.click()}
              >
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Generiere dein Video...
                    </p>
                    {generationStatus && (
                      <div className="w-full mt-4 space-y-2">
                        <Progress value={generationStatus.progress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground/70">
                          {generationStatus.progress}% - {generationStatus.status === 'processing' ? 'In Bearbeitung' : generationStatus.status}
                        </p>
                        {taskId && (
                          <p className="text-xs text-center text-muted-foreground/50 font-mono">
                            Task: {taskId.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground/70">
                      Dies kann 1-3 Minuten dauern
                    </p>
                  </div>
                ) : generationStatus?.status === 'failed' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <p className="text-sm text-red-400">
                      Video-Generierung fehlgeschlagen
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/70 text-center">
                      {generationStatus.error || 'Unbekannter Fehler'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-red-500/30 text-red-400"
                      onClick={handleGenerate}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Erneut versuchen
                    </Button>
                  </div>
                ) : generatedVideo ? (
                  <>
                    <video
                      src={generatedVideo}
                      controls
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Fertig
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    <Play className="h-16 w-16 mb-4 opacity-50 group-hover:opacity-70" />
                    <p className="text-sm">
                      {sourceImage ? "Dein generiertes Video erscheint hier" : "Klicke hier um ein Bild hochzuladen"}
                    </p>
                    {!sourceImage && selectedModel?.features.textToVideo && (
                      <p className="text-xs mt-2 opacity-70">
                        oder starte ohne Bild für Text-to-Video
                      </p>
                    )}
                    {!sourceImage && !selectedModel?.features.textToVideo && (
                      <p className="text-xs mt-2 opacity-70 text-amber-400">
                        Dieses Modell benötigt ein Ausgangsbild
                      </p>
                    )}
                  </div>
                )}
              </div>

              {generatedVideo && (
                <div className="mt-4 flex gap-2">
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

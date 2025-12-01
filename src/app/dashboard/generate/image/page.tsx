"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  ImagePlus
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

export default function GenerateImagePage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const referenceId = searchParams.get("referenceId")

  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("1:1")
  const [model, setModel] = useState<"kie-standard" | "kie-realistic" | "kie-artistic">("kie-standard")
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

  useEffect(() => {
    fetchPresets()
    fetchGalleryImages()
  }, [])

  // Load reference image from URL param
  useEffect(() => {
    if (referenceId && galleryImages.length > 0) {
      const image = galleryImages.find(img => img.id === referenceId)
      if (image) {
        setReferenceImage(image)
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
    story: '📱 Story',
    carousel: '🎠 Karussell',
    brand: '✨ Branding',
    other: '🎨 Sonstige'
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Bitte gib einen Prompt ein")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          aspectRatio,
          model,
          presetId: selectedPreset || undefined,
          projectId: projectId || undefined,
          referenceImageUrl: referenceImage?.fileUrl || undefined,
          referenceImageId: referenceImage?.id || undefined,
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

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const aspectRatios = [
    { value: "1:1", label: "1:1", description: "Quadratisch" },
    { value: "4:5", label: "4:5", description: "Portrait" },
    { value: "9:16", label: "9:16", description: "Story/Reel" },
    { value: "16:9", label: "16:9", description: "Landscape" },
  ]

  const models = [
    { value: "kie-standard", label: "Standard", description: "Schnell & vielseitig" },
    { value: "kie-realistic", label: "Realistisch", description: "Fotorealistische Bilder" },
    { value: "kie-artistic", label: "Künstlerisch", description: "Kreative Stile" },
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
              <CardContent className="space-y-4">
                {Array.from(getPresetCategories()).map(([category, categoryPresets]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {categoryLabels[category] || category}
                    </p>
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
                ))}
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

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <Label className="text-foreground">Seitenverhältnis</Label>
                <div className="grid grid-cols-4 gap-2">
                  {aspectRatios.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value as typeof aspectRatio)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        aspectRatio === ar.value
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{ar.label}</span>
                      <span className="text-xs opacity-70">{ar.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-3">
                <Label className="text-foreground">Modell</Label>
                <div className="grid grid-cols-3 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value as typeof model)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        model === m.value
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{m.label}</span>
                      <span className="text-xs opacity-70 text-center">{m.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            className="w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0" 
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
                Bild generieren
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-xl sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ImageIcon className="h-5 w-5 text-primary" />
              Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square rounded-xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Generiere dein Bild...
                  </p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="h-full w-full object-cover"
                />
              ) : referenceImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={referenceImage.fileUrl}
                    alt="Reference image"
                    className="h-full w-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <ImagePlus className="h-10 w-10 mb-2 text-primary/70" />
                    <p className="text-sm text-white/80">Referenzbild ausgewählt</p>
                    <p className="text-xs text-white/50 mt-1">Klicke "Bild generieren"</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-sm">Dein generiertes Bild erscheint hier</p>
                </div>
              )}
            </div>

            {generatedImage && (
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

      {/* Gallery Picker Dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bild aus Galerie wählen</DialogTitle>
            <DialogDescription>
              Wähle ein hochgeladenes Bild als Referenz
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
                  refFileInputRef.current?.click()
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
                  onClick={() => {
                    setReferenceImage(image)
                    setShowGalleryPicker(false)
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
    </div>
  )
}

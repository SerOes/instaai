"use client"

import { useState, useEffect } from "react"
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
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function GenerateVideoPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")

  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("9:16")
  const [duration, setDuration] = useState<"3" | "5" | "10">("5")
  const [motion, setMotion] = useState<"subtle" | "moderate" | "dynamic">("moderate")
  const [model, setModel] = useState<"kie-video-standard" | "kie-video-premium">("kie-video-standard")
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPresets()
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
        if (preset.duration) {
          const durationStr = preset.duration.toString() as typeof duration
          if (['3', '5', '10'].includes(durationStr)) {
            setDuration(durationStr)
          }
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
    setJobId(null)

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
          motion,
          model,
          presetId: selectedPreset || undefined,
          projectId: projectId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler bei der Videogenerierung")
        return
      }

      if (data.status === "completed") {
        setGeneratedVideo(data.videoUrl)
      } else if (data.status === "processing") {
        setJobId(data.jobId)
        // In a real app, you would poll for status updates
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
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

  const aspectRatios = [
    { value: "1:1", label: "1:1", description: "Quadratisch" },
    { value: "4:5", label: "4:5", description: "Feed Post" },
    { value: "9:16", label: "9:16", description: "Reel/Story" },
    { value: "16:9", label: "16:9", description: "Landscape" },
  ]

  const durations = [
    { value: "3", label: "3s", description: "Kurz" },
    { value: "5", label: "5s", description: "Standard" },
    { value: "10", label: "10s", description: "Lang" },
  ]

  const motionOptions = [
    { value: "subtle", label: "Dezent", description: "Sanfte Bewegungen" },
    { value: "moderate", label: "Moderat", description: "Natürliche Bewegungen" },
    { value: "dynamic", label: "Dynamisch", description: "Energetische Bewegungen" },
  ]

  const models = [
    { value: "kie-video-standard", label: "Standard", description: "Schnell & effizient" },
    { value: "kie-video-premium", label: "Premium", description: "Höchste Qualität" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Settings2 className="h-3 w-3" />
                {showAdvanced ? "Weniger Optionen" : "Erweiterte Optionen (Bild-zu-Video)"}
              </button>

              {showAdvanced && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label htmlFor="imageUrl" className="text-foreground">
                    Ausgangsbild <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      placeholder="URL eines Bildes für Image-to-Video"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="bg-secondary/20 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <Button variant="outline" size="icon" className="border-border/50 hover:bg-secondary/50">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Füge ein Bild hinzu, um es zum Leben zu erwecken
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
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{ar.label}</span>
                      <span className="text-xs opacity-70">{ar.description}</span>
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
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value as typeof duration)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        duration === d.value
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{d.label}</span>
                      <span className="text-xs opacity-70">{d.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion */}
              <div className="space-y-3">
                <Label className="text-foreground">Bewegungsintensität</Label>
                <div className="grid grid-cols-3 gap-2">
                  {motionOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMotion(m.value as typeof motion)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        motion === m.value
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{m.label}</span>
                      <span className="text-xs opacity-70 text-center">{m.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-3">
                <Label className="text-foreground">Modell</Label>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value as typeof model)}
                      className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-200 ${
                        model === m.value
                          ? "border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10"
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
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-xl sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Video className="h-5 w-5 text-blue-500" />
              Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[9/16] rounded-xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Generiere dein Video...
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Dies kann einige Minuten dauern
                  </p>
                </div>
              ) : jobId && !generatedVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Clock className="h-16 w-16 text-blue-500 animate-pulse mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Video wird verarbeitet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Job ID: {jobId}
                  </p>
                </div>
              ) : generatedVideo ? (
                <video
                  src={generatedVideo}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                  <Play className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-sm">Dein generiertes Video erscheint hier</p>
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
  )
}

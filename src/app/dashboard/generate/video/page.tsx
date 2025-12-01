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
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface Preset {
  id: string
  name: string
  promptTemplate: string
  style?: string
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video generieren</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Erstelle beeindruckende KI-generierte Videos für Instagram Reels
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-blue-500" />
                Prompt
              </CardTitle>
              <CardDescription>
                Beschreibe das Video, das du erstellen möchtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Videobeschreibung</Label>
                <Textarea
                  id="prompt"
                  placeholder="z.B. A coffee cup with steam rising, gentle camera movement revealing a cozy cafe interior, morning atmosphere with soft golden light..."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">
                  Ausgangsbild <span className="text-gray-400">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="URL eines Bildes für Image-to-Video"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Füge ein Bild hinzu, um es zum Leben zu erwecken
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          {presets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPreset === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPreset(null)}
                  >
                    Kein Preset
                  </Button>
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-500" />
                Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Aspect Ratio */}
              <div className="space-y-3">
                <Label>Seitenverhältnis</Label>
                <div className="grid grid-cols-4 gap-2">
                  {aspectRatios.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value as typeof aspectRatio)}
                      className={`flex flex-col items-center rounded-lg border p-3 transition-all ${
                        aspectRatio === ar.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{ar.label}</span>
                      <span className="text-xs text-gray-500">{ar.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Dauer
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value as typeof duration)}
                      className={`flex flex-col items-center rounded-lg border p-3 transition-all ${
                        duration === d.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{d.label}</span>
                      <span className="text-xs text-gray-500">{d.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion */}
              <div className="space-y-3">
                <Label>Bewegungsintensität</Label>
                <div className="grid grid-cols-3 gap-2">
                  {motionOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMotion(m.value as typeof motion)}
                      className={`flex flex-col items-center rounded-lg border p-3 transition-all ${
                        motion === m.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{m.label}</span>
                      <span className="text-xs text-gray-500 text-center">{m.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-3">
                <Label>Modell</Label>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value as typeof model)}
                      className={`flex flex-col items-center rounded-lg border p-3 transition-all ${
                        model === m.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{m.label}</span>
                      <span className="text-xs text-gray-500 text-center">{m.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="lg" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" className="mr-2" />
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
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[9/16] rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Generiere dein Video...
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Dies kann einige Minuten dauern
                  </p>
                </div>
              ) : jobId && !generatedVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Clock className="h-16 w-16 text-blue-500 animate-pulse" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    Video wird verarbeitet
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Play className="h-16 w-16" />
                  <p className="mt-4 text-sm">Dein generiertes Video erscheint hier</p>
                </div>
              )}
            </div>

            {generatedVideo && (
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
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

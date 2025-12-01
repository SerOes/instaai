"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Settings2,
  Wand2,
  Copy,
  Check,
  Image as ImageIcon
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

export default function GenerateImagePage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")

  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("1:1")
  const [model, setModel] = useState<"kie-standard" | "kie-realistic" | "kie-artistic">("kie-standard")
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPresets()
  }, [])

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bild generieren</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Erstelle beeindruckende KI-generierte Bilder für Instagram
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Prompt
              </CardTitle>
              <CardDescription>
                Beschreibe das Bild, das du erstellen möchtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">Bildbeschreibung</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyPrompt}
                    disabled={!prompt}
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
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negativePrompt">
                  Negative Prompt <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="negativePrompt"
                  placeholder="z.B. blurry, low quality, distorted"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          {presets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Presets
                </CardTitle>
                <CardDescription>
                  Verwende vordefinierte Stilvorlagen
                </CardDescription>
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
                <Settings2 className="h-5 w-5 text-purple-500" />
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
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{ar.label}</span>
                      <span className="text-xs text-gray-500">{ar.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-3">
                <Label>Modell</Label>
                <div className="grid grid-cols-3 gap-2">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value as typeof model)}
                      className={`flex flex-col items-center rounded-lg border p-3 transition-all ${
                        model === m.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
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
            className="w-full" 
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
                Bild generieren
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
              <ImageIcon className="h-5 w-5 text-purple-500" />
              Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Generiere dein Bild...
                  </p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="h-16 w-16" />
                  <p className="mt-4 text-sm">Dein generiertes Bild erscheint hier</p>
                </div>
              )}
            </div>

            {generatedImage && (
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Wand2,
  Building2,
  Users,
  Palette,
  Target
} from "lucide-react"
import Link from "next/link"

const STYLE_TAGS = [
  { id: "freundlich", label: "Freundlich", emoji: "😊" },
  { id: "professionell", label: "Professionell", emoji: "💼" },
  { id: "luxurioes", label: "Luxuriös", emoji: "✨" },
  { id: "verspielt", label: "Verspielt", emoji: "🎨" },
  { id: "minimalistisch", label: "Minimalistisch", emoji: "⚪" },
  { id: "emotional", label: "Emotional", emoji: "💖" },
  { id: "humorvoll", label: "Humorvoll", emoji: "😄" },
  { id: "inspirierend", label: "Inspirierend", emoji: "🌟" },
  { id: "authentisch", label: "Authentisch", emoji: "🤝" },
  { id: "modern", label: "Modern", emoji: "🚀" },
]

const CONTENT_GOALS = [
  { id: "follower", label: "Mehr Follower" },
  { id: "sales", label: "Mehr Verkäufe" },
  { id: "community", label: "Community" },
  { id: "brand", label: "Markenbekanntheit" },
]

interface SystemPromptData {
  systemPrompt: string
  brandName: string
  industry: string
  targetAudience: string
  brandStyle: string[]
  contentGoals: string[]
}

export default function SystemPromptSettingsPage() {
  const [data, setData] = useState<SystemPromptData>({
    systemPrompt: "",
    brandName: "",
    industry: "",
    targetAudience: "",
    brandStyle: [],
    contentGoals: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/system-prompt")
      if (response.ok) {
        const result = await response.json()
        setData({
          systemPrompt: result.systemPrompt || "",
          brandName: result.brandName || "",
          industry: result.industry || "",
          targetAudience: result.targetAudience || "",
          brandStyle: result.brandStyle || [],
          contentGoals: result.contentGoals || [],
        })
      }
    } catch (error) {
      console.error("Error fetching system prompt:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/system-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "System-Prompt erfolgreich gespeichert!" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Fehler beim Speichern" })
      }
    } catch {
      setMessage({ type: "error", text: "Fehler beim Speichern" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Möchtest du wirklich alle System-Prompt-Einstellungen zurücksetzen?")) {
      return
    }

    try {
      const response = await fetch("/api/user/system-prompt", { method: "DELETE" })
      if (response.ok) {
        setData({
          systemPrompt: "",
          brandName: "",
          industry: "",
          targetAudience: "",
          brandStyle: [],
          contentGoals: [],
        })
        setMessage({ type: "success", text: "System-Prompt zurückgesetzt" })
      }
    } catch {
      setMessage({ type: "error", text: "Fehler beim Zurücksetzen" })
    }
  }

  const toggleArrayItem = (field: "brandStyle" | "contentGoals", item: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System-Prompt Einstellungen</h1>
          <p className="text-slate-400 mt-1">
            Definiere deinen globalen Business-Kontext für alle KI-Generierungen
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Wand2 className="w-4 h-4 mr-2" />
            Wizard starten
          </Button>
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-500/20 border border-green-500/30 text-green-400"
            : "bg-red-500/20 border border-red-500/30 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Marke</p>
              <p className="text-white font-medium truncate">
                {data.brandName || "Nicht gesetzt"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Zielgruppe</p>
              <p className="text-white font-medium truncate">
                {data.targetAudience || "Nicht gesetzt"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Palette className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Stil-Tags</p>
              <p className="text-white font-medium">
                {data.brandStyle.length} ausgewählt
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Content-Ziele</p>
              <p className="text-white font-medium">
                {data.contentGoals.length} ausgewählt
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main System Prompt */}
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Globaler System-Prompt</h2>
        </div>
        
        <Textarea
          value={data.systemPrompt}
          onChange={(e) => setData(prev => ({ ...prev, systemPrompt: e.target.value }))}
          placeholder="Dein System-Prompt wird bei allen KI-Generierungen automatisch verwendet..."
          className="bg-slate-700/50 border-slate-600 text-white font-mono text-sm min-h-[200px]"
        />
        <p className="text-xs text-slate-500 mt-2">
          {data.systemPrompt.length} Zeichen • Dieser Prompt wird bei allen KI-Aufrufen vorangestellt
        </p>
      </Card>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Info */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Marken-Infos</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brandName" className="text-slate-300">Markenname</Label>
              <Input
                id="brandName"
                value={data.brandName}
                onChange={(e) => setData(prev => ({ ...prev, brandName: e.target.value }))}
                className="mt-1 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="industry" className="text-slate-300">Branche</Label>
              <Input
                id="industry"
                value={data.industry}
                onChange={(e) => setData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="targetAudience" className="text-slate-300">Zielgruppe</Label>
              <Input
                id="targetAudience"
                value={data.targetAudience}
                onChange={(e) => setData(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="mt-1 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>
        </Card>

        {/* Style & Goals */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Stil & Ziele</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Stil-Tags</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleArrayItem("brandStyle", tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      data.brandStyle.includes(tag.id)
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Content-Ziele</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleArrayItem("contentGoals", goal.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      data.contentGoals.includes(goal.id)
                        ? "bg-green-500 text-white"
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Zurücksetzen
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Änderungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

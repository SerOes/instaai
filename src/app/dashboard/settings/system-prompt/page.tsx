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
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System-Prompt Einstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Definiere deinen globalen Business-Kontext für alle KI-Generierungen
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="outline" className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-secondary/50">
            <Wand2 className="w-4 h-4 mr-2" />
            Wizard starten
          </Button>
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl backdrop-blur-sm border ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500"
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          {message.text}
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marke</p>
              <p className="text-foreground font-medium truncate">
                {data.brandName || "Nicht gesetzt"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Zielgruppe</p>
              <p className="text-foreground font-medium truncate">
                {data.targetAudience || "Nicht gesetzt"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Palette className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stil-Tags</p>
              <p className="text-foreground font-medium">
                {data.brandStyle.length} ausgewählt
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Content-Ziele</p>
              <p className="text-foreground font-medium">
                {data.contentGoals.length} ausgewählt
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main System Prompt */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-foreground">Globaler System-Prompt</h2>
        </div>
        
        <Textarea
          value={data.systemPrompt}
          onChange={(e) => setData(prev => ({ ...prev, systemPrompt: e.target.value }))}
          placeholder="Dein System-Prompt wird bei allen KI-Generierungen automatisch verwendet..."
          className="bg-secondary/20 border-border/50 text-foreground font-mono text-sm min-h-[200px] focus:ring-indigo-500/50"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {data.systemPrompt.length} Zeichen • Dieser Prompt wird bei allen KI-Aufrufen vorangestellt
        </p>
      </Card>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Info */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Marken-Infos</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brandName" className="text-muted-foreground">Markenname</Label>
              <Input
                id="brandName"
                value={data.brandName}
                onChange={(e) => setData(prev => ({ ...prev, brandName: e.target.value }))}
                className="mt-1 bg-secondary/20 border-border/50 text-foreground focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <Label htmlFor="industry" className="text-muted-foreground">Branche</Label>
              <Input
                id="industry"
                value={data.industry}
                onChange={(e) => setData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1 bg-secondary/20 border-border/50 text-foreground focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <Label htmlFor="targetAudience" className="text-muted-foreground">Zielgruppe</Label>
              <Input
                id="targetAudience"
                value={data.targetAudience}
                onChange={(e) => setData(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="mt-1 bg-secondary/20 border-border/50 text-foreground focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </Card>

        {/* Style & Goals */}
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stil & Ziele</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground mb-2 block">Stil-Tags</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleArrayItem("brandStyle", tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      data.brandStyle.includes(tag.id)
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-border/50"
                    }`}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground mb-2 block">Content-Ziele</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleArrayItem("contentGoals", goal.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      data.contentGoals.includes(goal.id)
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                        : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-border/50"
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
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Zurücksetzen
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-0"
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

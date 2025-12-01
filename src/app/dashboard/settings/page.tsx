"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  Instagram,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiKey {
  id: string
  name: string
  provider: string
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newKey, setNewKey] = useState({ name: "", provider: "GEMINI", key: "" })
  const [showKey, setShowKey] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/apikeys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.key) {
      setError("Name und Schlüssel sind erforderlich")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/apikeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newKey),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler beim Speichern")
        return
      }

      setApiKeys([...apiKeys, data.apiKey])
      setNewKey({ name: "", provider: "GEMINI", key: "" })
      setShowForm(false)
    } catch {
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Möchten Sie diesen API-Schlüssel wirklich löschen?")) return

    try {
      const response = await fetch(`/api/apikeys?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== id))
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const providers = [
    { value: "GEMINI", label: "Google Gemini", description: "Für Captions und Hashtags" },
    { value: "KIE", label: "KIE.ai", description: "Für Bild- und Videogenerierung" },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
        <p className="mt-1 text-muted-foreground">
          Verwalte deine API-Schlüssel und Kontoeinstellungen
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/settings/system-prompt">
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 cursor-pointer border-border/50 bg-card/50 backdrop-blur-xl">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    System-Prompt Wizard
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    KI-Persönlichkeit und Markenstil konfigurieren
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings/instagram">
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 hover:border-pink-500/50 cursor-pointer border-border/50 bg-card/50 backdrop-blur-xl">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg shadow-pink-500/20">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Instagram verbinden
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Accounts verknüpfen und verwalten
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* API Keys */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5 text-purple-500" />
              API-Schlüssel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Verbinde deine KI-Dienste für die Content-Generierung
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="gradient" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Schlüssel hinzufügen
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new key form */}
          {showForm && (
            <div className="rounded-xl border border-border/50 p-4 space-y-4 bg-secondary/30 backdrop-blur-sm">
              <h4 className="font-medium text-foreground">Neuer API-Schlüssel</h4>
              
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="keyName" className="text-foreground">Name</Label>
                  <Input
                    id="keyName"
                    placeholder="z.B. Gemini Production"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    className="bg-secondary/50 border-border focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-foreground">Anbieter</Label>
                  <select
                    id="provider"
                    className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-foreground focus:border-primary/50 focus:outline-none"
                    value={newKey.provider}
                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                  >
                    {providers.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyValue" className="text-foreground">API-Schlüssel</Label>
                <Input
                  id="keyValue"
                  type="password"
                  placeholder="Füge deinen API-Schlüssel ein"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  className="bg-secondary/50 border-border focus:border-primary/50"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)} className="border-border hover:bg-secondary/50">
                  Abbrechen
                </Button>
                <Button onClick={handleAddKey} disabled={saving} variant="gradient">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Speichern...
                    </>
                  ) : (
                    "Speichern"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Existing keys list */}
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Keine API-Schlüssel vorhanden</p>
              <p className="text-sm mt-1 opacity-70">
                Füge API-Schlüssel hinzu, um die KI-Funktionen zu nutzen.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      apiKey.provider === "GEMINI" 
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-purple-500/10 text-purple-500"
                    }`}>
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {apiKey.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{providers.find(p => p.value === apiKey.provider)?.label || apiKey.provider}</span>
                        <span>•</span>
                        <span>
                          {apiKey.isActive ? (
                            <span className="text-green-500">Aktiv</span>
                          ) : (
                            <span className="text-red-500">Inaktiv</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.value} className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardContent className="flex items-start gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                provider.value === "GEMINI" 
                  ? "bg-blue-500/10"
                  : "bg-purple-500/10"
              }`}>
                <Key className={`h-6 w-6 ${
                  provider.value === "GEMINI" ? "text-blue-500" : "text-purple-500"
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">
                  {provider.label}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {provider.description}
                </p>
                <a
                  href={provider.value === "GEMINI" 
                    ? "https://aistudio.google.com/app/apikey" 
                    : "https://kie.ai/api"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-purple-500 hover:text-purple-400 transition-colors"
                >
                  API-Schlüssel erhalten →
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

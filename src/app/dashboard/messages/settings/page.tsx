"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Bot, 
  Save,
  Clock,
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InstagramAccount {
  id: string
  username: string
  profilePicture: string | null
}

interface QuickReply {
  id: string
  label: string
  text: string
}

interface AutomationSettings {
  instagramAccountId: string
  isEnabled: boolean
  autoReplyEnabled: boolean
  defaultLanguage: string
  tone: string
  responseDelay: number
  systemPrompt: string | null
  contextWindow: number
  maxResponseLength: number
  categoryResponses: Record<string, string>
  quickReplies: QuickReply[]
  keywords: Record<string, string>
  blacklistedPhrases: string[]
  operatingHours: {
    enabled: boolean
    hours?: Record<string, { start: string; end: string }>
  }
  outOfOfficeMessage: string | null
  totalProcessed: number
  totalAutoReplied: number
}

export default function DMSettingsPage() {
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Form state
  const [newKeyword, setNewKeyword] = useState("")
  const [newKeywordResponse, setNewKeywordResponse] = useState("")
  const [newQuickReplyLabel, setNewQuickReplyLabel] = useState("")
  const [newQuickReplyText, setNewQuickReplyText] = useState("")
  const [newBlacklistedPhrase, setNewBlacklistedPhrase] = useState("")

  const fetchInstagramAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/instagram/accounts")
      if (response.ok) {
        const data = await response.json()
        setInstagramAccounts(data.accounts || [])
        if (data.accounts?.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data.accounts[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching Instagram accounts:", error)
    }
  }, [selectedAccountId])

  const fetchSettings = useCallback(async () => {
    if (!selectedAccountId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/dm/automation?accountId=${selectedAccountId}`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data.automation)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedAccountId])

  useEffect(() => {
    fetchInstagramAccounts()
  }, [fetchInstagramAccounts])

  useEffect(() => {
    if (selectedAccountId) {
      fetchSettings()
    }
  }, [selectedAccountId, fetchSettings])

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    setSaveSuccess(false)
    try {
      const response = await fetch("/api/dm/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof AutomationSettings>(
    key: K,
    value: AutomationSettings[K]
  ) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const addKeyword = () => {
    if (!newKeyword.trim() || !newKeywordResponse.trim() || !settings) return
    updateSetting("keywords", {
      ...settings.keywords,
      [newKeyword.toLowerCase()]: newKeywordResponse,
    })
    setNewKeyword("")
    setNewKeywordResponse("")
  }

  const removeKeyword = (keywordToRemove: string) => {
    if (!settings) return
    const newKeywords = Object.fromEntries(
      Object.entries(settings.keywords).filter(([key]) => key !== keywordToRemove)
    )
    updateSetting("keywords", newKeywords)
  }

  const addQuickReply = () => {
    if (!newQuickReplyLabel.trim() || !newQuickReplyText.trim() || !settings) return
    updateSetting("quickReplies", [
      ...settings.quickReplies,
      {
        id: Date.now().toString(),
        label: newQuickReplyLabel,
        text: newQuickReplyText,
      },
    ])
    setNewQuickReplyLabel("")
    setNewQuickReplyText("")
  }

  const removeQuickReply = (id: string) => {
    if (!settings) return
    updateSetting(
      "quickReplies",
      settings.quickReplies.filter((qr) => qr.id !== id)
    )
  }

  const addBlacklistedPhrase = () => {
    if (!newBlacklistedPhrase.trim() || !settings) return
    updateSetting("blacklistedPhrases", [
      ...settings.blacklistedPhrases,
      newBlacklistedPhrase.toLowerCase(),
    ])
    setNewBlacklistedPhrase("")
  }

  const removeBlacklistedPhrase = (phrase: string) => {
    if (!settings) return
    updateSetting(
      "blacklistedPhrases",
      settings.blacklistedPhrases.filter((p) => p !== phrase)
    )
  }

  if (loading && !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/messages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">DM-Automatisierung</h1>
            <p className="text-sm text-muted-foreground">Konfiguriere KI-gestützte Antworten</p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : saveSuccess ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveSuccess ? "Gespeichert!" : "Speichern"}
        </Button>
      </div>

      {/* Account Selector */}
      {instagramAccounts.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <Label>Instagram Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Account auswählen" />
              </SelectTrigger>
              <SelectContent>
                {instagramAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    @{account.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {settings && (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="ai">KI-Einstellungen</TabsTrigger>
            <TabsTrigger value="responses">Antworten</TabsTrigger>
            <TabsTrigger value="advanced">Erweitert</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Automatisierung
                </CardTitle>
                <CardDescription>
                  Aktiviere KI-gestützte DM-Antworten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>KI-Unterstützung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Generiere automatisch Antwortvorschläge für eingehende Nachrichten
                    </p>
                  </div>
                  <Switch
                    checked={settings.isEnabled}
                    onCheckedChange={(checked: boolean) => updateSetting("isEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatisches Antworten</Label>
                    <p className="text-sm text-muted-foreground">
                      Sende KI-Antworten automatisch ohne manuelle Freigabe
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoReplyEnabled}
                    onCheckedChange={(checked: boolean) => updateSetting("autoReplyEnabled", checked)}
                    disabled={!settings.isEnabled}
                  />
                </div>

                {settings.autoReplyEnabled && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-500">Achtung</p>
                      <p className="text-sm text-muted-foreground">
                        Automatische Antworten werden ohne deine Überprüfung gesendet. 
                        Stelle sicher, dass du die KI-Einstellungen sorgfältig konfiguriert hast.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Antwortverzögerung (Sekunden)</Label>
                  <p className="text-sm text-muted-foreground">
                    Verzögere Antworten für ein natürlicheres Gefühl
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={3600}
                    value={settings.responseDelay}
                    onChange={(e) => updateSetting("responseDelay", parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{settings.totalProcessed}</p>
                    <p className="text-sm text-muted-foreground">Verarbeitet</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{settings.totalAutoReplied}</p>
                    <p className="text-sm text-muted-foreground">Auto-Antworten</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  KI-Konfiguration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sprache</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => updateSetting("defaultLanguage", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="tr">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tonalität</Label>
                    <Select
                      value={settings.tone}
                      onValueChange={(value) => updateSetting("tone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Freundlich</SelectItem>
                        <SelectItem value="professional">Professionell</SelectItem>
                        <SelectItem value="casual">Locker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>System-Prompt (Markenkontext)</Label>
                  <p className="text-sm text-muted-foreground">
                    Gib der KI Kontext über deine Marke, Produkte und Kommunikationsstil
                  </p>
                  <Textarea
                    value={settings.systemPrompt || ""}
                    onChange={(e) => updateSetting("systemPrompt", e.target.value || null)}
                    placeholder="z.B. Du bist der Kundenservice von [Marke]. Wir verkaufen [Produkte] und sind bekannt für [USPs]..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kontext-Fenster</Label>
                    <p className="text-sm text-muted-foreground">
                      Anzahl vorheriger Nachrichten für Kontext
                    </p>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.contextWindow}
                      onChange={(e) => updateSetting("contextWindow", parseInt(e.target.value) || 5)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max. Antwortlänge</Label>
                    <p className="text-sm text-muted-foreground">
                      Maximale Zeichen pro Antwort
                    </p>
                    <Input
                      type="number"
                      min={50}
                      max={2000}
                      value={settings.maxResponseLength}
                      onChange={(e) => updateSetting("maxResponseLength", parseInt(e.target.value) || 500)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responses */}
          <TabsContent value="responses" className="space-y-4">
            {/* Quick Replies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Schnellantworten
                </CardTitle>
                <CardDescription>
                  Vordefinierte Antworten für häufige Fragen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Label (z.B. 'Öffnungszeiten')"
                    value={newQuickReplyLabel}
                    onChange={(e) => setNewQuickReplyLabel(e.target.value)}
                  />
                  <Input
                    placeholder="Antworttext"
                    value={newQuickReplyText}
                    onChange={(e) => setNewQuickReplyText(e.target.value)}
                  />
                  <Button onClick={addQuickReply} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {settings.quickReplies.map((qr) => (
                    <div
                      key={qr.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{qr.label}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {qr.text}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuickReply(qr.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {settings.quickReplies.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Noch keine Schnellantworten definiert
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Schlüsselwort-Antworten</CardTitle>
                <CardDescription>
                  Automatische Antworten basierend auf Schlüsselwörtern
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Schlüsselwort"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                  <Input
                    placeholder="Automatische Antwort"
                    value={newKeywordResponse}
                    onChange={(e) => setNewKeywordResponse(e.target.value)}
                  />
                  <Button onClick={addKeyword} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(settings.keywords).map(([keyword, response]) => (
                    <div
                      key={keyword}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">&quot;{keyword}&quot;</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          → {response}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKeyword(keyword)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {Object.keys(settings.keywords).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Noch keine Schlüsselwörter definiert
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-4">
            {/* Blacklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Blacklist
                </CardTitle>
                <CardDescription>
                  Nachrichten mit diesen Begriffen erfordern manuelle Überprüfung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Begriff hinzufügen"
                    value={newBlacklistedPhrase}
                    onChange={(e) => setNewBlacklistedPhrase(e.target.value)}
                  />
                  <Button onClick={addBlacklistedPhrase} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.blacklistedPhrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                    >
                      {phrase}
                      <button
                        onClick={() => removeBlacklistedPhrase(phrase)}
                        className="hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {settings.blacklistedPhrases.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Keine Begriffe auf der Blacklist
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Geschäftszeiten
                </CardTitle>
                <CardDescription>
                  Konfiguriere wann automatische Antworten aktiv sein sollen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Geschäftszeiten aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Antworten nur während bestimmter Zeiten
                    </p>
                  </div>
                  <Switch
                    checked={settings.operatingHours.enabled}
                    onCheckedChange={(checked: boolean) =>
                      updateSetting("operatingHours", {
                        ...settings.operatingHours,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                {settings.operatingHours.enabled && (
                  <div className="space-y-2">
                    <Label>Abwesenheitsnachricht</Label>
                    <Textarea
                      value={settings.outOfOfficeMessage || ""}
                      onChange={(e) => updateSetting("outOfOfficeMessage", e.target.value || null)}
                      placeholder="z.B. Vielen Dank für deine Nachricht! Wir sind derzeit nicht erreichbar und werden uns bald bei dir melden."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Instagram,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
  Users,
  Image as ImageIcon,
  CheckCircle,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Facebook,
  Settings,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InstagramAccount {
  id: string
  username: string
  profilePicture?: string
  igBusinessId: string
  followersCount?: number
  mediaCount?: number
  createdAt: string
  _count?: {
    postSchedules: number
  }
}

function InstagramSettingsContent() {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    // Check for success/error messages from OAuth callback
    const errorParam = searchParams.get("error")
    const successParam = searchParams.get("success")
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      setTimeout(() => setSuccess(null), 8000)
    }
    
    fetchAccounts()
  }, [searchParams])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/instagram/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    setError(null)

    try {
      // Check if Instagram OAuth is configured
      const statusRes = await fetch("/api/instagram/status")
      const status = await statusRes.json()

      if (!status.configured) {
        setError("Instagram-Verbindung ist noch nicht konfiguriert. Bitte kontaktiere den Administrator.")
        setConnecting(false)
        return
      }

      // Redirect to Instagram OAuth
      window.location.href = "/api/auth/instagram"
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte versuche es erneut.")
      setConnecting(false)
    }
  }

  const handleDisconnect = async (id: string, username: string) => {
    if (!confirm(`Möchtest du @${username} wirklich trennen? Alle geplanten Posts für diesen Account werden gelöscht.`)) return

    try {
      const response = await fetch(`/api/instagram/accounts/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setAccounts(accounts.filter((a) => a.id !== id))
        setSuccess(`@${username} wurde erfolgreich getrennt.`)
      } else {
        const data = await response.json()
        setError(data.error || "Fehler beim Trennen des Accounts")
      }
    } catch (error) {
      console.error("Error disconnecting account:", error)
      setError("Fehler beim Trennen des Accounts")
    }
  }

  const handleRefresh = async (id: string) => {
    try {
      const response = await fetch(`/api/instagram/accounts/${id}/refresh`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchAccounts()
        setSuccess("Account-Daten wurden aktualisiert")
      }
    } catch (error) {
      console.error("Error refreshing account:", error)
    }
  }

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
        <h1 className="text-3xl font-bold text-foreground">
          Instagram-Verbindung
        </h1>
        <p className="mt-1 text-muted-foreground">
          Verbinde und verwalte deine Instagram Business-Accounts für automatisches Posten
        </p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Connected Accounts */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Instagram className="h-5 w-5 text-pink-500" />
            Verbundene Accounts
            {accounts.length > 0 && (
              <span className="ml-2 rounded-full bg-pink-500/20 px-2 py-0.5 text-xs font-normal text-pink-500">
                {accounts.length}
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {accounts.length === 0 
              ? "Verbinde deinen ersten Instagram Business-Account"
              : "Verwalte deine verknüpften Instagram-Accounts"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 mb-6 shadow-lg shadow-pink-500/30">
                <Instagram className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Kein Instagram-Account verbunden
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Verbinde deinen Instagram Business-Account, um Inhalte direkt zu planen, zu posten und deine Performance zu analysieren.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="rounded-full bg-purple-500/20 p-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Automatisches Posten</p>
                    <p className="text-xs text-muted-foreground">Posts direkt veröffentlichen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="rounded-full bg-blue-500/20 p-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Planung</p>
                    <p className="text-xs text-muted-foreground">Posts im Voraus planen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="rounded-full bg-green-500/20 p-2">
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Sicher</p>
                    <p className="text-xs text-muted-foreground">Verschlüsselte Speicherung</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleConnect}
                disabled={connecting}
                size="lg"
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 shadow-lg shadow-pink-500/30 text-white border-0 px-8"
              >
                {connecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verbinde mit Instagram...
                  </>
                ) : (
                  <>
                    <Instagram className="mr-2 h-5 w-5" />
                    Mit Instagram verbinden
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-md overflow-hidden">
                        {account.profilePicture ? (
                          <img 
                            src={account.profilePicture} 
                            alt={account.username}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <Instagram className="h-7 w-7 text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-lg">
                          @{account.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {account.followersCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {account.followersCount.toLocaleString()} Follower
                          </span>
                        )}
                        {account.mediaCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {account.mediaCount} Posts
                          </span>
                        )}
                        {account._count?.postSchedules !== undefined && account._count.postSchedules > 0 && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Clock className="h-3.5 w-3.5" />
                            {account._count.postSchedules} geplant
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRefresh(account.id)}
                      title="Daten aktualisieren"
                      className="hover:bg-secondary/50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(account.id, account.username)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Account trennen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                onClick={handleConnect}
                disabled={connecting}
                variant="outline"
                className="w-full border-dashed border-border hover:bg-secondary/50 hover:border-pink-500/50 transition-all"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mr-2" />
                    Verbinde...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Weiteren Account verbinden
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Connect Guide */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader 
          className="cursor-pointer hover:bg-secondary/20 transition-colors rounded-t-xl"
          onClick={() => setShowGuide(!showGuide)}
        >
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              So verbindest du deinen Instagram-Account
            </div>
            <ArrowRight className={`h-5 w-5 transition-transform duration-200 ${showGuide ? 'rotate-90' : ''}`} />
          </CardTitle>
        </CardHeader>
        {showGuide && (
          <CardContent className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Instagram Business-Account erstellen</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Dein Instagram-Account muss ein <strong>Business</strong>- oder <strong>Creator</strong>-Account sein.
                </p>
                <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    <strong>So geht&apos;s:</strong> Instagram App → Einstellungen → Konto → Zu professionellem Konto wechseln
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-500" />
                  Mit Facebook-Seite verbinden
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Dein Instagram Business-Account muss mit einer Facebook-Seite verknüpft sein.
                </p>
                <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    <strong>So geht&apos;s:</strong> Instagram Einstellungen → Konto → Mit Facebook-Seite verknüpfen
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">In InstaAI verbinden</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Klicke auf &quot;Mit Instagram verbinden&quot; und melde dich bei Facebook an. Wähle die Facebook-Seiten und Instagram-Accounts aus, die du verbinden möchtest.
                </p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                  <p className="text-green-500 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Deine Zugangsdaten werden verschlüsselt gespeichert und niemals weitergegeben.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Help Links */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">Benötigst du Hilfe?</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://help.instagram.com/502981923235522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-400 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Instagram Business-Account erstellen
                </a>
                <a
                  href="https://www.facebook.com/business/help/898752960195806"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Mit Facebook verknüpfen
                </a>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Requirements Summary */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-5">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Voraussetzungen für die Verbindung
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
              <div className="rounded-full bg-pink-500/20 p-2">
                <Instagram className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Business-Account</p>
                <p className="text-xs text-muted-foreground">oder Creator-Account</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Facebook className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Facebook-Seite</p>
                <p className="text-xs text-muted-foreground">verknüpft mit Instagram</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Shield className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Admin-Zugriff</p>
                <p className="text-xs text-muted-foreground">auf die Facebook-Seite</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InstagramSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <InstagramSettingsContent />
    </Suspense>
  )
}

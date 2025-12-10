"use client"

import { useState, useEffect } from "react"
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
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InstagramAccount {
  id: string
  username: string
  profilePictureUrl?: string
  followersCount?: number
  mediaCount?: number
  isActive: boolean
  lastSync?: string
}

export default function InstagramSettingsPage() {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Check for success/error messages from OAuth callback
    const errorParam = searchParams.get("error")
    const successParam = searchParams.get("success")
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000)
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
      // Redirect to Instagram OAuth
      window.location.href = "/api/auth/instagram"
    } catch {
      setError("Verbindung fehlgeschlagen")
      setConnecting(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm("Möchten Sie diesen Instagram-Account wirklich trennen?")) return

    try {
      const response = await fetch(`/api/instagram/accounts?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setAccounts(accounts.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error disconnecting account:", error)
    }
  }

  const handleRefresh = async (id: string) => {
    // Refresh account data
    await fetchAccounts()
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
          Verbinde und verwalte deine Instagram Business-Accounts
        </p>
      </div>

      {/* Connection Status */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Instagram className="h-5 w-5 text-pink-500" />
            Verbundene Accounts
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Verknüpfe Instagram Business-Accounts für automatisches Posten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-500">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-500">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 mb-4 shadow-lg shadow-pink-500/20">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Kein Instagram-Account verbunden
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Verbinde deinen Instagram Business-Account, um Posts direkt aus der App zu planen und zu veröffentlichen.
              </p>
              <Button 
                onClick={handleConnect}
                disabled={connecting}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg shadow-pink-500/20 text-white border-0"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verbinden...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Instagram verbinden
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-md">
                      {account.profilePictureUrl ? (
                        <img 
                          src={account.profilePictureUrl} 
                          alt={account.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <Instagram className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          @{account.username}
                        </p>
                        {account.isActive && (
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <Check className="h-3 w-3" />
                            Aktiv
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {account.followersCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {account.followersCount.toLocaleString()} Follower
                          </span>
                        )}
                        {account.mediaCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {account.mediaCount} Posts
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
                      title="Aktualisieren"
                      className="hover:bg-secondary/50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(account.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Trennen"
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
                className="w-full border-border hover:bg-secondary/50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Weiteren Account verbinden
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-2">
            Voraussetzungen für Instagram-Verbindung
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Instagram Business- oder Creator-Account</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Mit einer Facebook-Seite verknüpft</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Admin-Zugriff auf die Facebook-Seite</span>
            </li>
          </ul>
          <a
            href="https://help.instagram.com/502981923235522"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm text-purple-500 hover:text-purple-400 transition-colors"
          >
            Mehr erfahren
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

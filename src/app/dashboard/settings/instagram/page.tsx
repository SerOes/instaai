"use client"

import { useState, useEffect } from "react"
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
  Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

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
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

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
      // In production, this would redirect to Instagram OAuth
      // For now, we show a message
      setError("Instagram OAuth wird in Produktion aktiviert. Bitte konfigurieren Sie INSTAGRAM_CLIENT_ID und INSTAGRAM_CLIENT_SECRET.")
    } catch {
      setError("Verbindung fehlgeschlagen")
    } finally {
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
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Instagram-Verbindung
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Verbinde und verwalte deine Instagram Business-Accounts
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Verbundene Accounts
          </CardTitle>
          <CardDescription>
            Verknüpfe Instagram Business-Accounts für automatisches Posten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4 text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 mb-4">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Kein Instagram-Account verbunden
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Verbinde deinen Instagram Business-Account, um Posts direkt aus der App zu planen und zu veröffentlichen.
              </p>
              <Button 
                onClick={handleConnect}
                disabled={connecting}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                {connecting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
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
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
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
                        <p className="font-medium text-gray-900 dark:text-white">
                          @{account.username}
                        </p>
                        {account.isActive && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            Aktiv
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDisconnect(account.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Weiteren Account verbinden
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Voraussetzungen für Instagram-Verbindung
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
            className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400"
          >
            Mehr erfahren
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  CheckCircle, 
  Settings, 
  ExternalLink,
  AlertCircle,
  Key,
  Globe
} from "lucide-react"

export default function InstagramAdminSetupPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState("")
  const [status, setStatus] = useState<{ configured: boolean; message: string } | null>(null)

  useEffect(() => {
    // Get current base URL
    setBaseUrl(window.location.origin)
    
    // Check Instagram OAuth status
    fetch("/api/instagram/status")
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error("Error checking status:", err))
  }, [])

  const redirectUri = `${baseUrl}/api/auth/callback/instagram`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Instagram OAuth Setup (Admin)
        </h1>
        <p className="mt-1 text-muted-foreground">
          Konfigurationsanleitung für die Instagram-Verbindung
        </p>
      </div>

      {/* Status Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Aktueller Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              status.configured 
                ? "bg-green-500/10 border border-green-500/20 text-green-500" 
                : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
            }`}>
              {status.configured ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{status.message}</p>
            </div>
          ) : (
            <div className="animate-pulse bg-secondary/30 h-12 rounded-lg" />
          )}
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            1. Environment Variables setzen
          </CardTitle>
          <CardDescription>
            Diese Werte müssen in deinem Deployment-System gesetzt werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              INSTAGRAM_CLIENT_ID
            </label>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-2 bg-secondary/50 rounded-lg font-mono text-sm text-foreground border border-border">
                {status?.configured ? "✓ Gesetzt" : "Noch nicht gesetzt"}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dies ist die App-ID deiner Facebook-App (nicht Instagram API!)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              INSTAGRAM_CLIENT_SECRET
            </label>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-2 bg-secondary/50 rounded-lg font-mono text-sm text-foreground border border-border">
                {status?.configured ? "✓ Gesetzt" : "Noch nicht gesetzt"}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dies ist das App-Secret deiner Facebook-App
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Redirect URI */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            2. OAuth Redirect URI
          </CardTitle>
          <CardDescription>
            Diese URL muss in Facebook Login for Business konfiguriert werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Gültige OAuth-Redirect-URI
            </label>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-2 bg-secondary/50 rounded-lg font-mono text-sm text-foreground border border-border break-all">
                {redirectUri}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(redirectUri, "redirect")}
                className="flex-shrink-0"
              >
                {copied === "redirect" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400 font-medium mb-2">
              📋 So fügst du die Redirect-URI in Facebook hinzu:
            </p>
            <ol className="text-sm text-blue-300 space-y-1 ml-4 list-decimal">
              <li>Gehe zu <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Meta for Developers</a></li>
              <li>Wähle deine App aus</li>
              <li>Gehe zu <strong>Facebook Login for Business</strong> → <strong>Einstellungen</strong></li>
              <li>Füge die obige URI bei <strong>&quot;Gültige OAuth-Redirect-URIs&quot;</strong> ein</li>
              <li>Aktiviere <strong>&quot;Client-OAuth-Anmeldung&quot;</strong></li>
              <li>Aktiviere <strong>&quot;Web-OAuth-Anmeldung&quot;</strong></li>
              <li>Aktiviere <strong>&quot;HTTPS erzwingen&quot;</strong></li>
              <li>Klicke auf <strong>&quot;Änderungen speichern&quot;</strong></li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Facebook App Setup */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            3. Facebook App konfigurieren
          </CardTitle>
          <CardDescription>
            Wichtige Einstellungen in deiner Facebook Developer App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="rounded-full bg-blue-500/20 p-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">App-Typ: Business</p>
                <p className="text-xs text-muted-foreground">Erstelle eine Business-App, keine Consumer-App</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="rounded-full bg-purple-500/20 p-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Produkt: Facebook Login for Business</p>
                <p className="text-xs text-muted-foreground">NICHT &quot;Instagram Basic Display&quot;!</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
              <div className="rounded-full bg-green-500/20 p-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Berechtigungen (für Production)</p>
                <p className="text-xs text-muted-foreground">
                  instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement, business_management
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Zu Meta for Developers
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Testing */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            4. Verbindung testen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Sobald alles konfiguriert ist, können User ihre Instagram-Accounts verbinden:
          </p>
          <a href="/dashboard/settings/instagram">
            <Button className="w-full">
              Zu Instagram-Einstellungen
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                Detaillierte Setup-Anleitung
              </p>
              <p className="text-xs text-muted-foreground">
                Vollständige Dokumentation mit Screenshots
              </p>
            </div>
            <a
              href="/docs/INSTAGRAM_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Dokumentation öffnen
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

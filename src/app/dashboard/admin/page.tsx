"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Users,
  Mail,
  Shield,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  invitedAt: string | null
  createdAt: string
  _count: {
    mediaProjects: number
    apiKeys: number
    instagramAccounts: number
  }
}

interface Invitation {
  id: string
  email: string
  name: string | null
  status: string
  expiresAt: string
  createdAt: string
  acceptedAt: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Invitation dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<{ url: string } | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/auth/login")
      return
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.email !== "serhat.oesmen@gmail.com") {
      router.push("/dashboard")
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [usersRes, invitationsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/invitations"),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json()
        setInvitations(invitationsData.invitations)
      }
    } catch (err) {
      console.error("Error fetching admin data:", err)
      setError("Fehler beim Laden der Daten")
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return

    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Einladung fehlgeschlagen")
      }

      setInviteSuccess({ url: data.invitation.invitationUrl })
      fetchData() // Refresh list
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setInviting(false)
    }
  }

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (err) {
      console.error("Error toggling user:", err)
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/admin/invitations?id=${invitationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (err) {
      console.error("Error deleting invitation:", err)
    }
  }

  const resetInviteDialog = () => {
    setInviteEmail("")
    setInviteName("")
    setInviteError(null)
    setInviteSuccess(null)
    setShowInviteDialog(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Ausstehend
          </span>
        )
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Akzeptiert
          </span>
        )
      case "EXPIRED":
        return (
          <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full">
            <XCircle className="h-3 w-3" />
            Abgelaufen
          </span>
        )
      default:
        return null
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Benutzerverwaltung</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Benutzer einladen
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-6 text-red-500">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Benutzer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Mail className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {invitations.filter(i => i.status === "PENDING").length}
                </p>
                <p className="text-sm text-muted-foreground">Ausstehende Einladungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Aktive Benutzer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Einladungen ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Alle Benutzer</CardTitle>
              <CardDescription>
                Verwalten Sie die registrierten Benutzer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === "ADMIN" ? "bg-primary/10" : "bg-secondary"
                      }`}>
                        {user.role === "ADMIN" ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <Users className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name || user.email}</p>
                          {user.role === "ADMIN" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                          {!user.isActive && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">
                              Deaktiviert
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{user._count.mediaProjects} Projekte</span>
                          <span>{user._count.instagramAccounts} IG-Accounts</span>
                          <span>Erstellt: {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role !== "ADMIN" && user.email !== session?.user?.email && (
                        <Button
                          variant={user.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserActive(user.id, user.isActive)}
                        >
                          {user.isActive ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Benutzer gefunden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Einladungen</CardTitle>
              <CardDescription>
                Verwalten Sie ausstehende Einladungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invitation.email}</p>
                          {getStatusBadge(invitation.status)}
                        </div>
                        {invitation.name && (
                          <p className="text-sm text-muted-foreground">{invitation.name}</p>
                        )}
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Eingeladen: {formatDate(invitation.createdAt)}</span>
                          {invitation.status === "PENDING" && (
                            <span>Läuft ab: {formatDate(invitation.expiresAt)}</span>
                          )}
                          {invitation.acceptedAt && (
                            <span>Akzeptiert: {formatDate(invitation.acceptedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {invitations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Einladungen vorhanden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => !open && resetInviteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Benutzer einladen
            </DialogTitle>
            <DialogDescription>
              Senden Sie eine Einladung an einen neuen Benutzer
            </DialogDescription>
          </DialogHeader>

          {inviteSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                Einladung erfolgreich erstellt!
              </div>
              <div className="space-y-2">
                <Label>Einladungslink</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteSuccess.url}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(inviteSuccess.url)}
                  >
                    {copiedUrl ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teilen Sie diesen Link mit dem eingeladenen Benutzer. Der Link ist 7 Tage gültig.
                </p>
              </div>
              <Button onClick={resetInviteDialog} className="w-full">
                Fertig
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {inviteError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {inviteError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteEmail">E-Mail Adresse *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="benutzer@beispiel.de"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteName">Name (optional)</Label>
                <Input
                  id="inviteName"
                  placeholder="Max Mustermann"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={resetInviteDialog} className="flex-1">
                  Abbrechen
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail || inviting}
                  className="flex-1"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Einladen...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Einladen
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

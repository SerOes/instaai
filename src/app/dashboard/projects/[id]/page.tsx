"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import {
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Edit2,
  Save,
  RefreshCw,
  Calendar,
  Clock,
  Hash,
  Copy,
  Check,
  Trash2,
  Download,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Instagram,
  Send,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Caption {
  id: string
  text: string
  hashtags: string
  tone?: string
  language: string
  isSelected: boolean
  version: number
  createdAt: string
}

interface PostSchedule {
  id: string
  scheduledAt: string
  status: string
  postType: string
  instagramAccount?: {
    id: string
    username: string
    profilePicture?: string
  }
}

interface Project {
  id: string
  title: string
  description?: string
  type: string
  status: string
  source: string
  fileUrl?: string
  thumbnailUrl?: string
  prompt?: string
  style?: string
  aspectRatio?: string
  model?: string
  provider?: string
  videoDuration?: number
  videoResolution?: string
  videoProvider?: string
  metadata?: string
  createdAt: string
  updatedAt: string
  captions: Caption[]
  postSchedules: PostSchedule[]
  preset?: {
    id: string
    name: string
  }
}

interface InstagramAccount {
  id: string
  username: string
  profilePicture?: string
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations("projects")
  const tCommon = useTranslations("common")
  const tGenerate = useTranslations("generate")
  const locale = useLocale()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Caption states
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [captionTone, setCaptionTone] = useState("casual")
  const [captionLanguage, setCaptionLanguage] = useState(locale)
  const [showCaptionOptions, setShowCaptionOptions] = useState(false)
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null)

  // Schedule states
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    accountId: "",
    date: "",
    time: "",
    postType: "FEED",
  })
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    fetchProject()
    fetchInstagramAccounts()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${id}`)
      if (!response.ok) {
        throw new Error("Projekt nicht gefunden")
      }
      const data = await response.json()
      setProject(data.project)
      setEditTitle(data.project.title)
      setEditDescription(data.project.description || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden")
    } finally {
      setLoading(false)
    }
  }

  const fetchInstagramAccounts = async () => {
    try {
      const response = await fetch("/api/instagram/accounts")
      if (response.ok) {
        const data = await response.json()
        setInstagramAccounts(data.accounts || [])
      }
    } catch (err) {
      console.error("Error fetching Instagram accounts:", err)
    }
  }

  const saveProject = async () => {
    if (!project) return

    try {
      setSaving(true)
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      })

      if (!response.ok) throw new Error("Fehler beim Speichern")

      const data = await response.json()
      setProject({ ...project, ...data.project })
      setIsEditingTitle(false)
    } catch (err) {
      console.error("Error saving project:", err)
    } finally {
      setSaving(false)
    }
  }

  const generateCaption = async () => {
    if (!project) return

    try {
      setGeneratingCaption(true)

      // Determine if it's a video (for Reels caption)
      const isReel = project.type === "VIDEO"

      // Build description from prompt and other metadata
      const description = project.prompt || project.title || "Instagram content"

      const response = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          description: description,
          style: captionTone,
          language: captionLanguage,
          includeEmojis: true,
          maxLength: isReel ? 2200 : 500,
        }),
      })

      if (!response.ok) throw new Error("Fehler bei der Caption-Generierung")

      // Reload project to get new caption
      await fetchProject()
    } catch (err) {
      console.error("Error generating caption:", err)
    } finally {
      setGeneratingCaption(false)
    }
  }

  const selectCaption = async (captionId: string) => {
    if (!project) return

    // Update local state
    setProject({
      ...project,
      captions: project.captions.map((c) => ({
        ...c,
        isSelected: c.id === captionId,
      })),
    })

    // You could also save this to the backend if needed
  }

  const copyCaption = async (caption: Caption) => {
    const hashtags = JSON.parse(caption.hashtags || "[]").join(" ")
    const fullText = `${caption.text}\n\n${hashtags}`
    await navigator.clipboard.writeText(fullText)
    setCopiedCaption(caption.id)
    setTimeout(() => setCopiedCaption(null), 2000)
  }

  const schedulePost = async () => {
    if (!project || !scheduleData.accountId || !scheduleData.date || !scheduleData.time) return

    try {
      setScheduling(true)
      const scheduledAt = new Date(`${scheduleData.date}T${scheduleData.time}`)

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          instagramAccountId: scheduleData.accountId,
          scheduledAt: scheduledAt.toISOString(),
          postType: scheduleData.postType,
        }),
      })

      if (!response.ok) throw new Error("Fehler beim Planen")

      setShowScheduleForm(false)
      setScheduleData({ accountId: "", date: "", time: "", postType: "FEED" })
      await fetchProject()
    } catch (err) {
      console.error("Error scheduling post:", err)
    } finally {
      setScheduling(false)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm("Zeitplan wirklich löschen?")) return

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchProject()
      }
    } catch (err) {
      console.error("Error deleting schedule:", err)
    }
  }

  const getDateLocale = () => {
    const localeMap: Record<string, string> = {
      de: "de-DE",
      en: "en-US",
      tr: "tr-TR",
    }
    return localeMap[locale] || "de-DE"
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-secondary text-muted-foreground border-transparent",
      SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      PUBLISHED: "bg-green-500/10 text-green-500 border-green-500/20",
      FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      PROCESSING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      POSTED: "bg-green-500/10 text-green-500 border-green-500/20",
      CANCELLED: "bg-secondary text-muted-foreground border-transparent",
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
          styles[status] || styles.DRAFT
        }`}
      >
        {t(`status.${status.toLowerCase()}`)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">{error || "Projekt nicht gefunden"}</p>
        <Button onClick={() => router.push("/dashboard/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tCommon("back")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/projects")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold"
                  autoFocus
                />
                <Button size="sm" onClick={saveProject} disabled={saving}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditTitle(project.title)
                    setIsEditingTitle(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  project.type === "VIDEO"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-purple-500/10 text-purple-500"
                }`}
              >
                {project.type === "VIDEO" ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <ImageIcon className="h-3 w-3" />
                )}
                {t(`types.${project.type.toLowerCase()}`)}
              </span>
              {getStatusBadge(project.status)}
              <span className="text-xs text-muted-foreground">
                {new Date(project.createdAt).toLocaleDateString(getDateLocale())}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {project.fileUrl && (
            <Button variant="outline" asChild>
              <a href={project.fileUrl} download>
                <Download className="mr-2 h-4 w-4" />
                {tCommon("download")}
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Media Preview */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{tCommon("preview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square bg-secondary/30 rounded-lg overflow-hidden">
              {project.type === "VIDEO" && project.fileUrl ? (
                <video
                  src={project.fileUrl}
                  className="h-full w-full object-cover"
                  controls
                  poster={project.thumbnailUrl || undefined}
                />
              ) : project.thumbnailUrl || project.fileUrl ? (
                <img
                  src={project.thumbnailUrl || project.fileUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  {project.type === "VIDEO" ? (
                    <Video className="h-16 w-16 text-muted-foreground/30" />
                  ) : (
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  )}
                </div>
              )}
            </div>

            {/* Metadata */}
            {(project.prompt || project.model || project.aspectRatio) && (
              <div className="mt-4 space-y-2 text-sm">
                {project.prompt && (
                  <div>
                    <span className="text-muted-foreground">Prompt: </span>
                    <span className="text-foreground">{project.prompt.slice(0, 150)}...</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {project.model && (
                    <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs">
                      {project.model}
                    </span>
                  )}
                  {project.aspectRatio && (
                    <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs">
                      {project.aspectRatio}
                    </span>
                  )}
                  {project.videoResolution && (
                    <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs">
                      {project.videoResolution}
                    </span>
                  )}
                  {project.videoDuration && (
                    <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs">
                      {project.videoDuration}s
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Captions & Schedule */}
        <div className="space-y-6">
          <Tabs defaultValue="captions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="captions" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Captions
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planen
              </TabsTrigger>
            </TabsList>

            {/* Captions Tab */}
            <TabsContent value="captions" className="mt-4 space-y-4">
              {/* Generate Caption */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Caption generieren</h3>
                      <p className="text-sm text-muted-foreground">
                        KI-generierte Caption für deinen Post
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCaptionOptions(!showCaptionOptions)}
                    >
                      {showCaptionOptions ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {showCaptionOptions && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Tonalität</Label>
                        <Select value={captionTone} onValueChange={setCaptionTone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Locker & Freundlich</SelectItem>
                            <SelectItem value="professional">Professionell</SelectItem>
                            <SelectItem value="humorous">Humorvoll</SelectItem>
                            <SelectItem value="inspirational">Inspirierend</SelectItem>
                            <SelectItem value="storytelling">Storytelling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sprache</Label>
                        <Select value={captionLanguage} onValueChange={setCaptionLanguage}>
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
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    variant="gradient"
                    onClick={generateCaption}
                    disabled={generatingCaption}
                  >
                    {generatingCaption ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generiere...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {project.captions.length > 0
                          ? "Neue Caption generieren"
                          : "Caption generieren"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Captions List */}
              {project.captions.length > 0 ? (
                <div className="space-y-3">
                  {project.captions.map((caption) => {
                    const hashtags = JSON.parse(caption.hashtags || "[]")
                    return (
                      <Card
                        key={caption.id}
                        className={`border-border/50 bg-card/50 backdrop-blur-xl transition-all cursor-pointer ${
                          caption.isSelected
                            ? "ring-2 ring-primary border-primary/50"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => selectCaption(caption.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {caption.isSelected && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  <Check className="mr-1 h-3 w-3" />
                                  Ausgewählt
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                v{caption.version} • {caption.tone || "Standard"}
                              </span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyCaption(caption)
                              }}
                            >
                              {copiedCaption === caption.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{caption.text}</p>
                          {hashtags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {hashtags.slice(0, 10).map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                              {hashtags.length > 10 && (
                                <span className="text-xs text-muted-foreground">
                                  +{hashtags.length - 10} mehr
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Hash className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">
                      Noch keine Caption vorhanden
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generiere eine Caption für deinen Post
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-4 space-y-4">
              {/* Add Schedule */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                <CardContent className="pt-4">
                  {showScheduleForm ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Post planen</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowScheduleForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {instagramAccounts.length > 0 ? (
                        <>
                          <div>
                            <Label>Instagram Account</Label>
                            <Select
                              value={scheduleData.accountId}
                              onValueChange={(v) =>
                                setScheduleData({ ...scheduleData, accountId: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Account wählen..." />
                              </SelectTrigger>
                              <SelectContent>
                                {instagramAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    @{account.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Datum</Label>
                              <Input
                                type="date"
                                value={scheduleData.date}
                                onChange={(e) =>
                                  setScheduleData({ ...scheduleData, date: e.target.value })
                                }
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div>
                              <Label>Uhrzeit</Label>
                              <Input
                                type="time"
                                value={scheduleData.time}
                                onChange={(e) =>
                                  setScheduleData({ ...scheduleData, time: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Post-Typ</Label>
                            <Select
                              value={scheduleData.postType}
                              onValueChange={(v) =>
                                setScheduleData({ ...scheduleData, postType: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FEED">Feed Post</SelectItem>
                                <SelectItem value="REEL">Reel</SelectItem>
                                <SelectItem value="STORY">Story</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            className="w-full"
                            onClick={schedulePost}
                            disabled={
                              scheduling ||
                              !scheduleData.accountId ||
                              !scheduleData.date ||
                              !scheduleData.time
                            }
                          >
                            {scheduling ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Post planen
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Instagram className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground mb-3">
                            Verbinde zuerst einen Instagram-Account
                          </p>
                          <Button variant="outline" asChild>
                            <Link href="/dashboard/settings/instagram">
                              Instagram verbinden
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Post planen</h3>
                        <p className="text-sm text-muted-foreground">
                          Plane deinen Post für Instagram
                        </p>
                      </div>
                      <Button onClick={() => setShowScheduleForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Planen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scheduled Posts */}
              {project.postSchedules.length > 0 ? (
                <div className="space-y-3">
                  {project.postSchedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className="border-border/50 bg-card/50 backdrop-blur-xl"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {schedule.instagramAccount?.profilePicture ? (
                              <img
                                src={schedule.instagramAccount.profilePicture}
                                alt={schedule.instagramAccount.username}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <Instagram className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                @{schedule.instagramAccount?.username || "Unbekannt"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(schedule.scheduledAt).toLocaleString(getDateLocale())}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(schedule.status)}
                            {schedule.status === "PENDING" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => deleteSchedule(schedule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs">
                            {schedule.postType}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Noch keine Posts geplant</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Plane deinen ersten Post für dieses Projekt
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Description Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Beschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Füge eine Beschreibung für dieses Projekt hinzu..."
            className="min-h-[100px] resize-none"
          />
          {editDescription !== (project.description || "") && (
            <div className="flex justify-end mt-3">
              <Button onClick={saveProject} disabled={saving}>
                {saving ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Speichern
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

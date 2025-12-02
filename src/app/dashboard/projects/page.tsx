"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { 
  Plus, 
  Search, 
  Filter,
  Image,
  Video,
  Trash2,
  Edit,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Project {
  id: string
  title: string
  type: string
  status: string
  thumbnailUrl?: string
  fileUrl?: string
  createdAt: string
  _count?: {
    captions: number
    postSchedules: number
  }
}

export default function ProjectsPage() {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return

    setDeleteId(id)
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filterType || project.type === filterType
    return matchesSearch && matchesType
  })

  const getDateLocale = () => {
    const localeMap: Record<string, string> = {
      de: "de-DE",
      en: "en-US",
      tr: "tr-TR"
    }
    return localeMap[locale] || "de-DE"
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-secondary text-muted-foreground border-transparent",
      SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      PUBLISHED: "bg-green-500/10 text-green-500 border-green-500/20",
      FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    const labels: Record<string, string> = {
      DRAFT: t('status.draft'),
      SCHEDULED: t('status.scheduled'),
      PUBLISHED: t('status.published'),
      FAILED: t('status.failed'),
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {labels[status] || status}
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button variant="gradient" className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            {t('newProject')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10 bg-secondary/50 border-border focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(null)}
            className={filterType === null ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border"}
          >
            {t('filters.all')}
          </Button>
          <Button
            variant={filterType === "IMAGE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("IMAGE")}
            className={filterType === "IMAGE" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border"}
          >
            <Image className="mr-2 h-4 w-4" />
            {t('filters.images')}
          </Button>
          <Button
            variant={filterType === "VIDEO" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("VIDEO")}
            className={filterType === "VIDEO" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border"}
          >
            <Video className="mr-2 h-4 w-4" />
            {t('filters.videos')}
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {searchQuery || filterType ? t('empty.titleFiltered') : t('empty.title')}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {searchQuery || filterType
                ? t('empty.subtitleFiltered')
                : t('empty.subtitle')}
            </p>
            {!searchQuery && !filterType && (
              <Link href="/dashboard/projects/new" className="mt-6">
                <Button variant="gradient" className="shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newProject')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="relative aspect-square bg-secondary/30">
                {project.thumbnailUrl || project.fileUrl ? (
                  <img
                    src={project.thumbnailUrl || project.fileUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {project.type === "VIDEO" ? (
                      <Video className="h-12 w-12 text-muted-foreground/30" />
                    ) : (
                      <Image className="h-12 w-12 text-muted-foreground/30" />
                    )}
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                      <Edit className="mr-1 h-4 w-4" />
                      {tCommon('edit')}
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(project.id)}
                    disabled={deleteId === project.id}
                    className="bg-red-500/80 hover:bg-red-500"
                  >
                    {deleteId === project.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Type badge */}
                <div className="absolute right-2 top-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg ${
                    project.type === "VIDEO" 
                      ? "bg-blue-500/80 text-white" 
                      : "bg-purple-500/80 text-white"
                  }`}>
                    {project.type === "VIDEO" ? (
                      <><Video className="mr-1 h-3 w-3" /> {t('types.video')}</>
                    ) : (
                      <><Image className="mr-1 h-3 w-3" /> {t('types.image')}</>
                    )}
                  </span>
                </div>
              </div>

              <CardContent className="p-4">
                <Link href={`/dashboard/projects/${project.id}`}>
                  <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString(getDateLocale())}
                  </span>
                </div>
                {project._count && (project._count.captions > 0 || project._count.postSchedules > 0) && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {project._count.captions > 0 && (
                      <span>{project._count.captions} {t('captions')}{project._count.captions !== 1 && "s"}</span>
                    )}
                    {project._count.postSchedules > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project._count.postSchedules} {t('scheduled')}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

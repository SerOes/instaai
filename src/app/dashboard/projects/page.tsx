"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter,
  Image,
  Video,
  MoreVertical,
  Trash2,
  Edit,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

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
    if (!confirm("Möchten Sie dieses Projekt wirklich löschen?")) return

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

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    }
    const labels = {
      DRAFT: "Entwurf",
      SCHEDULED: "Geplant",
      PUBLISHED: "Veröffentlicht",
      FAILED: "Fehlgeschlagen",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projekte</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Verwalte deine generierten Bilder und Videos
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Projekte durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(null)}
          >
            Alle
          </Button>
          <Button
            variant={filterType === "IMAGE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("IMAGE")}
          >
            <Image className="mr-2 h-4 w-4" />
            Bilder
          </Button>
          <Button
            variant={filterType === "VIDEO" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("VIDEO")}
          >
            <Video className="mr-2 h-4 w-4" />
            Videos
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Filter className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery || filterType ? "Keine Ergebnisse" : "Noch keine Projekte"}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || filterType
                ? "Versuche eine andere Suche oder Filter."
                : "Erstelle dein erstes Projekt, um loszulegen."}
            </p>
            {!searchQuery && !filterType && (
              <Link href="/dashboard/projects/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Projekt
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group overflow-hidden">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                {project.thumbnailUrl || project.fileUrl ? (
                  <img
                    src={project.thumbnailUrl || project.fileUrl}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {project.type === "VIDEO" ? (
                      <Video className="h-12 w-12 text-gray-400" />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button size="sm" variant="secondary">
                      <Edit className="mr-1 h-4 w-4" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(project.id)}
                    disabled={deleteId === project.id}
                  >
                    {deleteId === project.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Type badge */}
                <div className="absolute right-2 top-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    project.type === "VIDEO" 
                      ? "bg-blue-500 text-white" 
                      : "bg-purple-500 text-white"
                  }`}>
                    {project.type === "VIDEO" ? (
                      <><Video className="mr-1 h-3 w-3" /> Video</>
                    ) : (
                      <><Image className="mr-1 h-3 w-3" /> Bild</>
                    )}
                  </span>
                </div>
              </div>

              <CardContent className="p-4">
                <Link href={`/dashboard/projects/${project.id}`}>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400">
                    {project.title}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
                {project._count && (project._count.captions > 0 || project._count.postSchedules > 0) && (
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {project._count.captions > 0 && (
                      <span>{project._count.captions} Caption{project._count.captions !== 1 && "s"}</span>
                    )}
                    {project._count.postSchedules > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project._count.postSchedules} geplant
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

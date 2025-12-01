"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  FolderOpen, 
  Image, 
  Video, 
  Calendar, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface DashboardStats {
  totalProjects: number
  scheduledPosts: number
  publishedPosts: number
  totalImages: number
  totalVideos: number
}

interface RecentProject {
  id: string
  title: string
  type: string
  status: string
  thumbnailUrl?: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentProjects(data.recentProjects)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    { 
      name: "Bild generieren", 
      href: "/dashboard/generate/image", 
      icon: Image,
      color: "from-purple-500 to-pink-500",
      description: "KI-generierte Bilder erstellen"
    },
    { 
      name: "Video generieren", 
      href: "/dashboard/generate/video", 
      icon: Video,
      color: "from-blue-500 to-cyan-500",
      description: "Reels und Videos erstellen"
    },
    { 
      name: "Neues Projekt", 
      href: "/dashboard/projects/new", 
      icon: Plus,
      color: "from-green-500 to-emerald-500",
      description: "Content-Projekt anlegen"
    },
    { 
      name: "Zeitplan", 
      href: "/dashboard/schedule", 
      icon: Calendar,
      color: "from-orange-500 to-amber-500",
      description: "Posts planen und verwalten"
    },
  ]

  const statsCards = [
    { 
      name: "Projekte", 
      value: stats?.totalProjects || 0, 
      icon: FolderOpen,
      color: "text-purple-600 dark:text-purple-400"
    },
    { 
      name: "Geplante Posts", 
      value: stats?.scheduledPosts || 0, 
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400"
    },
    { 
      name: "Veröffentlicht", 
      value: stats?.publishedPosts || 0, 
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400"
    },
    { 
      name: "Generierte Bilder", 
      value: stats?.totalImages || 0, 
      icon: Image,
      color: "text-pink-600 dark:text-pink-400"
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Willkommen zurück{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Erstelle beeindruckenden Instagram-Content mit KI-Unterstützung.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href}>
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                  {action.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Neueste Projekte</CardTitle>
            <CardDescription>Deine zuletzt erstellten Projekte</CardDescription>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm">
              Alle anzeigen
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Noch keine Projekte
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Erstelle dein erstes Projekt, um loszulegen.
              </p>
              <Link href="/dashboard/projects/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Projekt
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    {project.type === "VIDEO" ? (
                      <Video className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Image className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {project.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    project.status === "PUBLISHED" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : project.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}>
                    {project.status === "PUBLISHED" ? "Veröffentlicht" : project.status === "SCHEDULED" ? "Geplant" : "Entwurf"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips section */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tipp des Tages</h3>
            <p className="mt-1 text-white/90">
              Verwende spezifische Stilbeschreibungen in deinen Prompts für konsistentere Ergebnisse. 
              Zum Beispiel: &quot;cinematic lighting, golden hour, shallow depth of field&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

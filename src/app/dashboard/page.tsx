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
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Willkommen zurück{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}! <span className="animate-wave inline-block">👋</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Erstelle beeindruckenden Instagram-Content mit KI-Unterstützung.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href} className="group">
            <Card className="h-full border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 group-hover:ring-1 group-hover:ring-primary/20">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.name} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex items-center gap-5 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent projects */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle>Neueste Projekte</CardTitle>
            <CardDescription>Deine zuletzt erstellten Projekte</CardDescription>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              Alle anzeigen
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl bg-secondary/20">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Noch keine Projekte
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Erstelle dein erstes Projekt, um loszulegen.
              </p>
              <Link href="/dashboard/projects/new" className="mt-6">
                <Button variant="gradient" size="lg" className="shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-5 w-5" />
                  Neues Projekt starten
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-transparent p-4 transition-all hover:bg-secondary/50 hover:border-border/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary group-hover:bg-background transition-colors">
                    {project.type === "VIDEO" ? (
                      <Video className="h-6 w-6 text-blue-500" />
                    ) : (
                      <Image className="h-6 w-6 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {project.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                    project.status === "PUBLISHED" 
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : project.status === "SCHEDULED"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-secondary text-muted-foreground border-transparent"
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative flex items-center gap-6 rounded-xl bg-black/10 backdrop-blur-sm p-8">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner border border-white/20">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tipp des Tages</h3>
            <p className="mt-2 text-white/90 text-lg leading-relaxed">
              Verwende spezifische Stilbeschreibungen in deinen Prompts für konsistentere Ergebnisse. 
              Zum Beispiel: <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm">cinematic lighting, golden hour</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

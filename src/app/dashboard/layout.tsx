"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { 
  LayoutDashboard, 
  FolderOpen, 
  Image, 
  Video, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Instagram,
  ImagePlus,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projekte", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Meine Bilder", href: "/dashboard/gallery", icon: ImagePlus },
  { name: "Bilder generieren", href: "/dashboard/generate/image", icon: Image },
  { name: "Videos generieren", href: "/dashboard/generate/video", icon: Video },
  { name: "Direktnachrichten", href: "/dashboard/messages", icon: MessageCircle },
  { name: "Content-Planer", href: "/dashboard/schedule", icon: Calendar },
  { name: "Einstellungen", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('nav')
  const tDashboard = useTranslations('dashboard')
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: t('dashboard'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('projects'), href: "/dashboard/projects", icon: FolderOpen },
    { name: t('myImages'), href: "/dashboard/gallery", icon: ImagePlus },
    { name: t('generateImages'), href: "/dashboard/generate/image", icon: Image },
    { name: t('generateVideos'), href: "/dashboard/generate/video", icon: Video },
    { name: t('contentPlanner'), href: "/dashboard/schedule", icon: Calendar },
    { name: t('settings'), href: "/dashboard/settings", icon: Settings },
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card/30 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                InstaAI
              </span>
            </Link>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-inner shadow-primary/5"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-white/5 p-6 bg-black/20">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-10 w-10 ring-2 ring-white/10">
                <AvatarImage src={session.user?.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {getInitials(session.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.user?.name || tDashboard('user')}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>

        {/* Top bar */}
        <header className="relative z-10 flex h-20 items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md px-6 lg:px-8">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/dashboard/settings/instagram">
              <Button variant="glass" size="sm" className="gap-2 rounded-full px-4">
                <Instagram className="h-4 w-4" />
                <span className="hidden sm:inline">{t('connectInstagram')}</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  )
}

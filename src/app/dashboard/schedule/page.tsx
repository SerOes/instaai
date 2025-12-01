"use client"

import { useState, useEffect } from "react"
import { 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image,
  Video,
  MoreVertical,
  Trash2,
  Edit
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"

interface Schedule {
  id: string
  scheduledAt: string
  status: string
  caption?: string
  project: {
    id: string
    title: string
    type: string
    thumbnailUrl?: string
  }
  instagramAccount: {
    id: string
    username: string
    profilePicture?: string
  }
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"calendar" | "list">("list")

  useEffect(() => {
    fetchSchedules()
  }, [currentDate])

  const fetchSchedules = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const response = await fetch(
        `/api/schedules?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Zeitplan wirklich löschen?")) return

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setSchedules(schedules.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Error deleting schedule:", error)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }
    const labels = {
      SCHEDULED: "Geplant",
      PUBLISHED: "Veröffentlicht",
      FAILED: "Fehlgeschlagen",
      CANCELLED: "Abgebrochen",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.SCHEDULED}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = new Date(schedule.scheduledAt).toLocaleDateString("de-DE")
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(schedule)
    return groups
  }, {} as Record<string, Schedule[]>)

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content-Planer</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Plane und verwalte deine Instagram-Posts
          </p>
        </div>
        <Link href="/dashboard/projects">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neuen Post planen
          </Button>
        </Link>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine geplanten Posts
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Erstelle ein Projekt und plane deinen ersten Post.
            </p>
            <Link href="/dashboard/projects" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Projekt erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {date}
              </h3>
              <div className="space-y-3">
                {daySchedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        {schedule.project.thumbnailUrl ? (
                          <img
                            src={schedule.project.thumbnailUrl}
                            alt={schedule.project.title}
                            className="h-full w-full object-cover"
                          />
                        ) : schedule.project.type === "VIDEO" ? (
                          <Video className="h-8 w-8 text-gray-400" />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/dashboard/projects/${schedule.project.id}`}
                            className="font-medium text-gray-900 dark:text-white truncate hover:text-purple-600"
                          >
                            {schedule.project.title}
                          </Link>
                          {getStatusBadge(schedule.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(schedule.scheduledAt).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={schedule.instagramAccount.profilePicture} />
                              <AvatarFallback className="text-xs">
                                {schedule.instagramAccount.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            @{schedule.instagramAccount.username}
                          </span>
                        </div>
                        {schedule.caption && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {schedule.caption}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/projects/${schedule.project.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

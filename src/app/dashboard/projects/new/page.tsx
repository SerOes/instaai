"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Image, Video, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

const projectSchema = z.object({
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: "IMAGE",
    },
  })

  const selectedType = watch("type")

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Fehler beim Erstellen des Projekts")
        return
      }

      // Redirect to the generation page based on type
      if (data.type === "VIDEO") {
        router.push(`/dashboard/generate/video?projectId=${result.project.id}`)
      } else {
        router.push(`/dashboard/generate/image?projectId=${result.project.id}`)
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neues Projekt</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Erstelle ein neues Content-Projekt
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Projekt erstellen
          </CardTitle>
          <CardDescription>
            Wähle einen Projekttyp und gib die grundlegenden Informationen ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div className="space-y-3">
              <Label>Projekttyp</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("type", "IMAGE")}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    selectedType === "IMAGE"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    selectedType === "IMAGE"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}>
                    <Image className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">Bild</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      KI-generierte Bilder
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("type", "VIDEO")}
                  className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${
                    selectedType === "VIDEO"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    selectedType === "VIDEO"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}>
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">Video</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Reels und Videos
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Projekttitel</Label>
              <Input
                id="title"
                placeholder="z.B. Produktlaunch Kampagne"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Beschreibung <span className="text-gray-400">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Beschreibe kurz, worum es in diesem Projekt geht..."
                rows={3}
                {...register("description")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/projects" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Abbrechen
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Erstellen...
                  </>
                ) : (
                  <>
                    Projekt erstellen
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

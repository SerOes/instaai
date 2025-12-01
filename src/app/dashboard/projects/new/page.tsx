"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { ArrowLeft, Image, Video, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewProjectPage() {
  const t = useTranslations('projects.new')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const projectSchema = useMemo(() => (
    z.object({
      title: z.string().min(1, t('titleRequired')),
      description: z.string().optional(),
      type: z.enum(["IMAGE", "VIDEO"]),
    })
  ), [t])

  type ProjectFormData = z.infer<typeof projectSchema>

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
        setError(result.error || tCommon('error'))
        return
      }

      // Redirect to the generation page based on type
      if (data.type === "VIDEO") {
        router.push(`/dashboard/generate/video?projectId=${result.project.id}`)
      } else {
        router.push(`/dashboard/generate/image?projectId=${result.project.id}`)
      }
    } catch {
      setError(tCommon('error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t('createTitle')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('createSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div className="space-y-3">
              <Label className="text-foreground">{t('projectType')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("type", "IMAGE")}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-300 ${
                    selectedType === "IMAGE"
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    selectedType === "IMAGE"
                      ? "bg-purple-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    <Image className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{t('typeImage')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('typeImageDesc')}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("type", "VIDEO")}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-300 ${
                    selectedType === "VIDEO"
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/50"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    selectedType === "VIDEO"
                      ? "bg-blue-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{t('typeVideo')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('typeVideoDesc')}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">{t('projectTitle')}</Label>
              <Input
                id="title"
                placeholder={t('projectTitlePlaceholder')}
                {...register("title")}
                className="bg-secondary/50 border-border focus:border-primary/50"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                {t('description')} <span className="text-muted-foreground">({tCommon('optional')})</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                {...register("description")}
                className="bg-secondary/50 border-border focus:border-primary/50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/projects" className="flex-1">
                <Button type="button" variant="outline" className="w-full border-border hover:bg-secondary/50">
                  {tCommon('cancel')}
                </Button>
              </Link>
              <Button type="submit" className="flex-1 shadow-lg shadow-primary/20" variant="gradient" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {t('creating')}
                  </>
                ) : (
                  <>
                    {t('createButton')}
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

"use client"

import { useState, useEffect } from "react"
import {
  Sparkles,
  Calendar,
  Loader2,
  RefreshCw,
  Filter,
  Image,
  Video,
  LayoutGrid,
  X,
  AlertCircle,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { IdeaCard, SeasonalIdea } from "./IdeaCard"
import { ContentWizard } from "./ContentWizard"

interface SeasonalIdeasPanelProps {
  isOpen: boolean
  onClose: () => void
  currentMonth: number
  currentYear: number
  onContentCreated?: () => void
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
]

export function SeasonalIdeasPanel({
  isOpen,
  onClose,
  currentMonth,
  currentYear,
  onContentCreated,
}: SeasonalIdeasPanelProps) {
  const [ideas, setIdeas] = useState<SeasonalIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresSystemPrompt, setRequiresSystemPrompt] = useState(false)
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "image" | "video" | "carousel">("all")
  const [selectedIdea, setSelectedIdea] = useState<SeasonalIdea | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    if (isOpen && ideas.length === 0) {
      fetchIdeas()
    }
  }, [isOpen])

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)
    setRequiresSystemPrompt(false)

    try {
      const response = await fetch("/api/generate/seasonal-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          year: currentYear,
          count: 6,
          locale: "at", // Austria-specific
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresSystemPrompt) {
          setRequiresSystemPrompt(true)
        }
        throw new Error(data.error || "Fehler beim Laden der Ideen")
      }

      setIdeas(data.ideas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectIdea = (idea: SeasonalIdea) => {
    setSelectedIdea(idea)
    setShowWizard(true)
  }

  const handleWizardComplete = () => {
    setShowWizard(false)
    setSelectedIdea(null)
    onContentCreated?.()
  }

  const filteredIdeas = contentTypeFilter === "all"
    ? ideas
    : ideas.filter(idea => idea.contentType === contentTypeFilter)

  const getSeasonIcon = () => {
    if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
      return "❄️" // Winter
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      return "🌸" // Spring
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      return "☀️" // Summer
    } else {
      return "🍂" // Autumn
    }
  }

  return (
    <>
      <Dialog open={isOpen && !showWizard} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span>{getSeasonIcon()}</span>
              <Sparkles className="h-5 w-5 text-primary" />
              Saisonale Content-Ideen
            </DialogTitle>
            <DialogDescription>
              Personalisierte Content-Ideen für {MONTH_NAMES[currentMonth - 1]} {currentYear} basierend auf deinem Markenprofil
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Filters & Actions */}
            <div className="flex items-center justify-between gap-4 mb-4 sticky top-0 bg-background z-10 pb-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={contentTypeFilter}
                  onValueChange={(value) => setContentTypeFilter(value as typeof contentTypeFilter)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> Alle
                      </span>
                    </SelectItem>
                    <SelectItem value="image">
                      <span className="flex items-center gap-2">
                        <Image className="h-4 w-4" /> Bilder
                      </span>
                    </SelectItem>
                    <SelectItem value="video">
                      <span className="flex items-center gap-2">
                        <Video className="h-4 w-4" /> Videos
                      </span>
                    </SelectItem>
                    <SelectItem value="carousel">
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> Carousel
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchIdeas}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Neue Ideen
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="mt-4 text-muted-foreground">
                  KI generiert saisonale Ideen...
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Basierend auf deinem Markenprofil und aktuellen Events
                </p>
              </div>
            )}

            {/* System Prompt Required */}
            {requiresSystemPrompt && !loading && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="flex flex-col items-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">System-Prompt erforderlich</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    Um personalisierte saisonale Ideen zu generieren, benötigen wir dein Markenprofil.
                    Bitte richte zuerst deinen System-Prompt in den Einstellungen ein.
                  </p>
                  <Link href="/dashboard/settings/system-prompt">
                    <Button variant="gradient">
                      <Settings className="h-4 w-4 mr-2" />
                      System-Prompt einrichten
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && !requiresSystemPrompt && !loading && (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardContent className="flex flex-col items-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Fehler</h3>
                  <p className="text-muted-foreground text-center mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchIdeas}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Erneut versuchen
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ideas Grid */}
            {!loading && !error && !requiresSystemPrompt && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIdeas.map((idea, index) => (
                  <IdeaCard
                    key={index}
                    idea={idea}
                    onSelect={() => handleSelectIdea(idea)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && !requiresSystemPrompt && filteredIdeas.length === 0 && ideas.length > 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Keine Ideen für diesen Filter gefunden
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setContentTypeFilter("all")}
                  className="mt-2"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Wizard */}
      {showWizard && selectedIdea && (
        <ContentWizard
          idea={selectedIdea}
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false)
            setSelectedIdea(null)
          }}
          onComplete={handleWizardComplete}
        />
      )}
    </>
  )
}

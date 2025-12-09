"use client"

import { Calendar, Image, Video, LayoutGrid, Tag, Hash, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface SeasonalIdea {
  title: string
  description: string
  contentType: "image" | "video" | "carousel"
  imagePrompt: string
  videoPrompt: string
  captionSuggestion: string
  hashtags: string[]
  seasonalTags: string[]
  suggestedDate: string
}

interface IdeaCardProps {
  idea: SeasonalIdea
  onSelect: () => void
}

const CONTENT_TYPE_CONFIG = {
  image: {
    icon: Image,
    label: "Bild",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  video: {
    icon: Video,
    label: "Video",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  carousel: {
    icon: LayoutGrid,
    label: "Carousel",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
}

export function IdeaCard({ idea, onSelect }: IdeaCardProps) {
  const config = CONTENT_TYPE_CONFIG[idea.contentType]
  const Icon = config.icon

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("de-AT", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all duration-300 group cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(idea.suggestedDate)}
          </div>
        </div>
        <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
          {idea.title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {idea.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Seasonal Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {idea.seasonalTags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Caption Preview */}
        <div className="bg-secondary/30 rounded-lg p-2 mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {idea.captionSuggestion}
          </p>
        </div>

        {/* Hashtags Preview */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Hash className="h-3 w-3" />
          <span className="truncate">
            {idea.hashtags.slice(0, 3).join(" ")}
            {idea.hashtags.length > 3 && ` +${idea.hashtags.length - 3}`}
          </span>
        </div>

        {/* Action Button */}
        <Button
          variant="gradient"
          size="sm"
          className="w-full group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          Content erstellen
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}

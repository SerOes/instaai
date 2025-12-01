import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-600 border-t-indigo-500",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  message?: string
  submessage?: string
}

export function LoadingState({ message = "Laden...", submessage }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Spinner size="lg" />
      <div className="text-center">
        <p className="text-slate-200 font-medium">{message}</p>
        {submessage && (
          <p className="text-sm text-slate-400 mt-1">{submessage}</p>
        )}
      </div>
    </div>
  )
}

export function AILoadingState({ type }: { type: "image" | "video" | "caption" }) {
  const messages = {
    image: {
      message: "Wir zaubern dir gerade das perfekte Bild ✨",
      submessage: "Das kann einen Moment dauern...",
    },
    video: {
      message: "Dein Video wird gerade erstellt 🎬",
      submessage: "Videogenerierung kann einige Sekunden dauern...",
    },
    caption: {
      message: "Die KI schreibt gerade deinen Text ✍️",
      submessage: "Gleich fertig...",
    },
  }

  const { message, submessage } = messages[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
        <Spinner size="lg" className="relative" />
      </div>
      <div className="text-center">
        <p className="text-slate-200 font-medium">{message}</p>
        <p className="text-sm text-slate-400 mt-1">{submessage}</p>
      </div>
    </div>
  )
}

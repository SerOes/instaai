"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Users, 
  Palette, 
  Target, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Check
} from "lucide-react"

const INDUSTRIES = [
  "E-Commerce / Online-Shop",
  "Handgemachte Produkte / Handwerk",
  "Mode & Fashion",
  "Beauty & Kosmetik",
  "Food & Gastronomie",
  "Fitness & Gesundheit",
  "Coaching & Beratung",
  "Fotografie & Kreativ",
  "Tech & Software",
  "Sonstiges",
]

const STYLE_TAGS = [
  { id: "freundlich", label: "Freundlich", emoji: "😊" },
  { id: "professionell", label: "Professionell", emoji: "💼" },
  { id: "luxurioes", label: "Luxuriös", emoji: "✨" },
  { id: "verspielt", label: "Verspielt", emoji: "🎨" },
  { id: "minimalistisch", label: "Minimalistisch", emoji: "⚪" },
  { id: "emotional", label: "Emotional", emoji: "💖" },
  { id: "humorvoll", label: "Humorvoll", emoji: "😄" },
  { id: "inspirierend", label: "Inspirierend", emoji: "🌟" },
  { id: "authentisch", label: "Authentisch", emoji: "🤝" },
  { id: "modern", label: "Modern", emoji: "🚀" },
]

const CONTENT_GOALS = [
  { id: "follower", label: "Mehr Follower gewinnen", icon: Users },
  { id: "sales", label: "Mehr Verkäufe generieren", icon: Target },
  { id: "community", label: "Community-Interaktion steigern", icon: Sparkles },
  { id: "brand", label: "Markenbekanntheit aufbauen", icon: Building2 },
]

interface WizardData {
  brandName: string
  industry: string
  products: string
  targetAudience: string
  region: string
  problemSolved: string
  stylesTags: string[]
  brandFeeling: string
  contentGoals: string[]
  captionExamples: string
  avoidWords: string
}

const initialData: WizardData = {
  brandName: "",
  industry: "",
  products: "",
  targetAudience: "",
  region: "",
  problemSolved: "",
  stylesTags: [],
  brandFeeling: "",
  contentGoals: [],
  captionExamples: "",
  avoidWords: "",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  
  const totalSteps = 6
  const progress = (step / totalSteps) * 100

  const updateData = (field: keyof WizardData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: "stylesTags" | "contentGoals", item: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const generateSystemPrompt = (): string => {
    const stylesText = data.stylesTags.length > 0 
      ? data.stylesTags.map(s => STYLE_TAGS.find(t => t.id === s)?.label).join(", ")
      : "professionell und freundlich"
    
    const goalsText = data.contentGoals.length > 0
      ? data.contentGoals.map(g => CONTENT_GOALS.find(c => c.id === g)?.label).join(", ")
      : "Reichweite und Engagement steigern"

    let prompt = `Du bist ein erfahrener Social-Media-Creative Director und Copywriter für die Marke „${data.brandName || "meine Marke"}".
`

    if (data.industry || data.products) {
      prompt += `Die Marke ist in der Branche "${data.industry || "Allgemein"}" tätig`
      if (data.products) {
        prompt += ` und bietet ${data.products}`
      }
      prompt += ".\n"
    }

    if (data.targetAudience || data.region) {
      prompt += `Die Zielgruppe sind ${data.targetAudience || "Menschen"}`
      if (data.region) {
        prompt += ` in ${data.region}`
      }
      if (data.problemSolved) {
        prompt += `, die ${data.problemSolved}`
      }
      prompt += ".\n"
    }

    prompt += `
Markenstil: ${stylesText}.
${data.brandFeeling ? `Die Marke soll sich anfühlen wie: ${data.brandFeeling}.` : ""}
Content-Ziele: ${goalsText}.

Schreibe Captions und generiere Bild-/Videoideen immer in diesem Stil.
Sprich die Leser:innen direkt an („du") und verwende einen positiven, einladenden Ton.`

    if (data.avoidWords) {
      prompt += `\nVermeide: ${data.avoidWords}.`
    }

    if (data.captionExamples) {
      prompt += `\n\nBeispiele für den gewünschten Ton:\n${data.captionExamples}`
    }

    return prompt
  }

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 5) {
        // Generate preview before final step
        setGeneratedPrompt(generateSystemPrompt())
      }
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const systemPrompt = generatedPrompt || generateSystemPrompt()
      
      const response = await fetch("/api/user/system-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          brandName: data.brandName,
          industry: data.industry,
          targetAudience: data.targetAudience,
          brandStyle: data.stylesTags,
          contentGoals: data.contentGoals,
        }),
      })

      if (!response.ok) {
        throw new Error("Fehler beim Speichern")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving system prompt:", error)
      alert("Fehler beim Speichern. Bitte versuche es erneut.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.brandName.trim().length > 0
      case 2:
        return data.targetAudience.trim().length > 0
      case 3:
        return data.stylesTags.length > 0
      case 4:
        return data.contentGoals.length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Schritt {step} von {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        {/* Step Content */}
        <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 shadow-inner shadow-primary/5">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Dein Business</h2>
                <p className="text-muted-foreground">Erzähle uns von deiner Marke</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="brandName" className="text-foreground">
                    Wie heißt deine Marke / dein Business? *
                  </Label>
                  <Input
                    id="brandName"
                    value={data.brandName}
                    onChange={(e) => updateData("brandName", e.target.value)}
                    placeholder="z.B. Duygu Handdesigns"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label htmlFor="industry" className="text-foreground">
                    In welcher Branche bist du?
                  </Label>
                  <select
                    id="industry"
                    value={data.industry}
                    onChange={(e) => updateData("industry", e.target.value)}
                    className="mt-2 w-full rounded-lg bg-secondary/50 border border-border text-foreground p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                  >
                    <option value="">Branche wählen...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="products" className="text-foreground">
                    Was verkaufst du hauptsächlich?
                  </Label>
                  <Textarea
                    id="products"
                    value={data.products}
                    onChange={(e) => updateData("products", e.target.value)}
                    placeholder="z.B. handgemachte personalisierte Produkte wie Schultüten, Turnbeutel und Tassen für Kinder"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 mb-4 shadow-inner shadow-pink-500/5">
                  <Users className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Deine Zielgruppe</h2>
                <p className="text-muted-foreground">Wer sind deine idealen Kunden?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetAudience" className="text-foreground">
                    Wer ist deine Hauptzielgruppe? *
                  </Label>
                  <Input
                    id="targetAudience"
                    value={data.targetAudience}
                    onChange={(e) => updateData("targetAudience", e.target.value)}
                    placeholder="z.B. Mütter mit Kindern im Grundschulalter"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-foreground">
                    In welcher Region sind sie hauptsächlich?
                  </Label>
                  <Input
                    id="region"
                    value={data.region}
                    onChange={(e) => updateData("region", e.target.value)}
                    placeholder="z.B. Deutschland, Österreich, Schweiz"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label htmlFor="problemSolved" className="text-foreground">
                    Welches Problem löst du für sie?
                  </Label>
                  <Textarea
                    id="problemSolved"
                    value={data.problemSolved}
                    onChange={(e) => updateData("problemSolved", e.target.value)}
                    placeholder="z.B. suchen einzigartige, personalisierte Geschenke für besondere Anlässe ihrer Kinder"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Brand Style */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 mb-4 shadow-inner shadow-orange-500/5">
                  <Palette className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Markenstil & Tonalität</h2>
                <p className="text-muted-foreground">Wie soll sich deine Marke anfühlen?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-foreground mb-3 block">
                    Wähle passende Stil-Tags (mind. 1) *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleArrayItem("stylesTags", tag.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          data.stylesTags.includes(tag.id)
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        }`}
                      >
                        {tag.emoji} {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="brandFeeling" className="text-foreground">
                    Beschreibe, wie sich deine Marke anfühlen soll
                  </Label>
                  <Textarea
                    id="brandFeeling"
                    value={data.brandFeeling}
                    onChange={(e) => updateData("brandFeeling", e.target.value)}
                    placeholder="z.B. Wie eine liebe Freundin, die immer die besten Geschenkideen hat - herzlich, kreativ und zuverlässig"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Content Goals */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4 shadow-inner shadow-green-500/5">
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Content-Ziele</h2>
                <p className="text-muted-foreground">Was möchtest du mit deinem Content erreichen?</p>
              </div>

              <div className="space-y-3">
                {CONTENT_GOALS.map((goal) => {
                  const Icon = goal.icon
                  const isSelected = data.contentGoals.includes(goal.id)
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleArrayItem("contentGoals", goal.id)}
                      className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10"
                          : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/50 hover:border-border"
                      }`}
                    >
                      <div className={`p-3 rounded-lg transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{goal.label}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5: Examples & Restrictions */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-4 shadow-inner shadow-purple-500/5">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Beispiele & Einschränkungen</h2>
                <p className="text-muted-foreground">Optional: Verfeinere deinen Stil</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="captionExamples" className="text-foreground">
                    Beispiele, wie deine Captions klingen sollen
                  </Label>
                  <Textarea
                    id="captionExamples"
                    value={data.captionExamples}
                    onChange={(e) => updateData("captionExamples", e.target.value)}
                    placeholder="z.B. 'Heute zeig ich dir mein neues Lieblingsprojekt 💕 Schau mal, ist das nicht süß?'"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gib 1-3 Beispiel-Sätze an, die deinen Stil gut repräsentieren
                  </p>
                </div>

                <div>
                  <Label htmlFor="avoidWords" className="text-foreground">
                    Wörter/Stile, die vermieden werden sollen
                  </Label>
                  <Textarea
                    id="avoidWords"
                    value={data.avoidWords}
                    onChange={(e) => updateData("avoidWords", e.target.value)}
                    placeholder="z.B. aggressive Verkaufssprache, 'Kauf jetzt!', übertriebene Superlative"
                    className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Preview & Confirm */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4 shadow-inner shadow-indigo-500/5">
                  <Check className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Dein System-Prompt</h2>
                <p className="text-muted-foreground">Überprüfe und bestätige deinen generierten Prompt</p>
              </div>

              <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Generierter Prompt</h3>
                  <span className="text-xs text-muted-foreground">{generatedPrompt.length} Zeichen</span>
                </div>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="bg-background/50 border-border text-foreground font-mono text-sm focus:border-primary/50"
                  rows={12}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Du kannst den Prompt hier noch manuell anpassen
                </p>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <h4 className="text-primary font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  So wird dein Prompt verwendet
                </h4>
                <p className="text-muted-foreground text-sm">
                  Dieser System-Prompt wird bei allen KI-Generierungen automatisch verwendet - 
                  für Captions, Hashtags, Bilder und Videos. So bleibt dein Content immer 
                  konsistent mit deiner Marke.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                variant="gradient"
                className="shadow-lg shadow-primary/20"
              >
                Weiter
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Fertig & zum Dashboard
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Skip Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Überspringen und später einrichten
          </button>
        </div>
      </div>
    </div>
  )
}

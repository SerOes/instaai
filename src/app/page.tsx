import Link from "next/link"
import { Sparkles, Image, Video, Calendar, Hash, Wand2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const features = [
    {
      icon: Image,
      title: "KI-Bildgenerierung",
      description: "Erstelle atemberaubende Bilder mit modernsten KI-Modellen für deinen Instagram-Feed.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Video,
      title: "Video & Reels",
      description: "Generiere fesselnde Videos und Reels, die deine Follower begeistern werden.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wand2,
      title: "Smart Captions",
      description: "Automatisch generierte Captions in verschiedenen Stilen, perfekt auf dein Content abgestimmt.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Hash,
      title: "Hashtag-Optimierung",
      description: "KI-optimierte Hashtags für maximale Reichweite und Engagement.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Calendar,
      title: "Content-Planung",
      description: "Plane und automatisiere deine Posts für konsistente Präsenz.",
      color: "from-rose-500 to-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              InstaAI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 text-sm text-purple-700 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Gemini & KIE.ai</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Erstelle viralen
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              {" "}Instagram-Content{" "}
            </span>
            mit KI
          </h1>
          
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            InstaAI nutzt die neuesten KI-Technologien, um atemberaubende Bilder, Videos, 
            Captions und Hashtags für deinen Instagram-Account zu generieren. 
            Spare Zeit und steigere dein Engagement.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-sm text-gray-500 dark:text-gray-400">
                InstaAI Dashboard
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="flex justify-center gap-4 mb-8">
                  <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Image className="h-16 w-16 text-white" />
                  </div>
                  <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Video className="h-16 w-16 text-white" />
                  </div>
                  <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Wand2 className="h-16 w-16 text-white" />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Erstelle beeindruckenden Content in Sekunden
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Alles, was du für Instagram brauchst
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Eine komplette Suite von KI-Tools für deine Content-Erstellung
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border bg-white dark:bg-gray-800 p-8 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-12 text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Bereit, deinen Instagram-Account zu transformieren?
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            Starte noch heute kostenlos und erlebe, wie KI deine Content-Erstellung revolutioniert.
          </p>
          <Link href="/auth/register" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Jetzt kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                InstaAI
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} InstaAI. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

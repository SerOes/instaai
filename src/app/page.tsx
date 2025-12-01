import Link from "next/link"
import { Sparkles, Image, Video, Calendar, Hash, Wand2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { LanguageSwitcher } from "@/components/language-switcher"

export default async function Home() {
  const t = await getTranslations('landing')
  const tNav = await getTranslations('nav')
  
  const features = [
    {
      icon: Image,
      title: t('features.imageGeneration.title'),
      description: t('features.imageGeneration.description'),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Video,
      title: t('features.videoReels.title'),
      description: t('features.videoReels.description'),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wand2,
      title: t('features.smartCaptions.title'),
      description: t('features.smartCaptions.description'),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Hash,
      title: t('features.hashtagOptimization.title'),
      description: t('features.hashtagOptimization.description'),
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Calendar,
      title: t('features.contentPlanning.title'),
      description: t('features.contentPlanning.description'),
      color: "from-rose-500 to-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none opacity-30" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              InstaAI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">{tNav('login')}</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="gradient" className="shadow-lg shadow-primary/20">
                {tNav('register')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-muted-foreground mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
              {t('hero.title2')}
            </span>
            <br />
            {t('hero.title3')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/auth/register">
              <Button size="lg" variant="gradient" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="glass" size="lg" className="h-14 px-8 text-lg hover:bg-white/10">
                {t('hero.learnMore')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mt-24 mx-auto max-w-6xl px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center text-sm text-muted-foreground font-medium">
                {t('preview.title')}
              </div>
            </div>
            
            <div className="aspect-video bg-black/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="text-center p-8 relative z-10">
                <div className="flex justify-center gap-6 mb-8">
                  {[
                    { id: "image", icon: Image, color: "from-purple-500 to-pink-500" },
                    { id: "video", icon: Video, color: "from-blue-500 to-cyan-500" },
                    { id: "wand", icon: Wand2, color: "from-green-500 to-emerald-500" }
                  ].map((item) => (
                    <div key={item.id} className={`h-32 w-32 rounded-2xl bg-gradient-to-br ${item.color} p-[1px] shadow-2xl transform hover:-translate-y-2 transition-transform duration-300`}>
                      <div className="h-full w-full bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <item.icon className="h-12 w-12 text-white/80" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  {t('preview.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('features.title').replace('{highlight}', '')}
              <span className="text-primary">{t('features.highlight')}</span>
              {' '}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="group p-8 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/25">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                {t('cta.description')}
              </p>
              <Link href="/auth/register" className="inline-block">
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary hover:bg-white/90 shadow-xl">
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                InstaAI
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
              <Link href="#" className="hover:text-primary transition-colors">{t('footer.imprint')}</Link>
              <Link href="#" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

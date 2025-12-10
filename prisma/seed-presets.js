/**
 * Seed script for AI Presets (JavaScript version for Docker runtime)
 * Seeds default IMAGE and VIDEO presets into the database
 * These are system presets (userId = null, isPublic = true)
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Define Image Presets inline (since we can't import TypeScript)
const IMAGE_PRESETS = [
  {
    name: 'Clean Product Shot',
    description: 'Freigestelltes Produkt, neutraler Hintergrund, Instagram-Feed',
    category: 'product',
    promptTemplate: `Subject: Ein einzelnes [PRODUKTNAME] steht im Vordergrund.
Composition: Frontale, mittlere Aufnahme, Produkt zentriert im Bild, viel Weißraum rundherum.
Action: Keine Aktion, das Produkt steht ruhig.
Location: Vor einem einfachen, sauberen Hintergrund mit sanftem Verlauf.
Style: Hochauflösende, fotorealistische Produktfotografie, weiches Studiolicht, sehr weiche Schatten.`,
    style: 'realistic',
    aspectRatio: '1:1',
  },
  {
    name: 'Story-Slide Minimal',
    description: 'Viel Weißraum, kurze Headline, Logo - perfekt für Instagram Stories',
    category: 'story',
    promptTemplate: `Subject: Flacher Hintergrund und ein zentrales Icon oder kleines Produktfoto.
Composition: Hochformat 9:16, viel freier Raum, das Icon oder Produkt im oberen Drittel.
Style: Minimalistischer Grafikstil, klare Flächen, keine Texturen, weiche Schatten.`,
    style: 'minimal',
    aspectRatio: '9:16',
  },
  {
    name: 'Karussell Infografik',
    description: 'Strukturierte Info mit Icons - ideal für Karussell-Posts',
    category: 'carousel',
    promptTemplate: `Subject: Informative Grafik mit klaren Abschnitten und Icons.
Composition: Quadratisches Format 1:1, klare visuelle Hierarchie, Nummerierung oder Punkte.
Style: Modern infographic design, flat icons, clear typography, professional look.`,
    style: 'modern',
    aspectRatio: '1:1',
  },
  {
    name: 'Lifestyle Product Scene',
    description: 'Produkt in realer Umgebung - authentisch und lebensnah',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] in einer natürlichen Alltagsszene.
Composition: Natürliche, leicht asymmetrische Komposition, Produkt im Vordergrund aber integriert in die Szene.
Action: Subtile Interaktion - jemand greift nach dem Produkt oder nutzt es beiläufig.
Location: Gemütliche, einladende Umgebung passend zur Zielgruppe.
Style: Warme, natürliche Fotografie mit weichem Tageslicht, authentische Atmosphäre.`,
    style: 'realistic',
    aspectRatio: '4:5',
  },
  {
    name: 'Zitat-Template',
    description: 'Elegantes Zitat-Design für motivierende Posts',
    category: 'brand',
    promptTemplate: `Subject: Typografisches Design mit einem inspirierenden Zitat.
Composition: Zentriertes Layout mit großzügigem Rand, Zitat im Fokus.
Style: Typografisch, elegant, lesbar, harmonische Schriftpaarung.
Text im Bild: "[ZITAT]" - [AUTOR] in eleganter Typografie.`,
    style: 'minimal',
    aspectRatio: '1:1',
  },
  {
    name: 'Vorher/Nachher Split',
    description: 'Split-Screen Design für Transformationen',
    category: 'product',
    promptTemplate: `Subject: Zwei kontrastierende Ansichten - links "Vorher", rechts "Nachher".
Composition: Vertikale Teilung des Bildes 50/50, klare Trennlinie oder sanfter Übergang.
Style: Klarer, deutlicher Unterschied zwischen den beiden Hälften, professionelle Qualität.
Text im Bild: "VORHER" und "NACHHER" Labels.`,
    style: 'realistic',
    aspectRatio: '1:1',
  },
  {
    name: 'Flat Lay Arrangement',
    description: 'Vogelperspektive auf arrangierte Produkte',
    category: 'product',
    promptTemplate: `Subject: Mehrere Produkte kunstvoll von oben arrangiert.
Composition: Vogelperspektive (top-down), symmetrische oder asymmetrische Anordnung.
Style: Hochauflösende Flat-Lay-Fotografie, weiches diffuses Licht von oben.`,
    style: 'realistic',
    aspectRatio: '1:1',
  },
  {
    name: 'Behind the Scenes',
    description: 'Authentische Einblicke in den Arbeitsprozess',
    category: 'lifestyle',
    promptTemplate: `Subject: Hände bei der Arbeit, Werkzeuge und Materialien sichtbar.
Composition: Natürlicher, leicht schräger Winkel, Fokus auf die Handarbeit.
Action: Aktive Arbeit - nähen, basteln, malen, verpacken oder gestalten.
Style: Dokumentarisch-authentischer Look, warme Farbtöne, natürliches Tageslicht.`,
    style: 'realistic',
    aspectRatio: '4:5',
  },
  {
    name: 'Hero Product Shot',
    description: 'Premium Hauptproduktbild für Website/Shop',
    category: 'product',
    promptTemplate: `Subject: Ein einzelnes [PRODUKTNAME] als Hero-Shot, perfekt präsentiert.
Composition: Zentrierte, frontale Aufnahme, Produkt füllt 60-70% des Frames.
Style: Ultra-hochauflösende kommerzielle Produktfotografie, drei-Punkt-Beleuchtung, perfekte Reflexionen.
Lighting: Professionelles Studiolicht mit Softboxen, dezente Rim-Lights.`,
    style: 'premium',
    aspectRatio: '1:1',
  },
  {
    name: 'Produkt-Detail Makro',
    description: 'Extreme Nahaufnahme für Texturen und Details',
    category: 'product',
    promptTemplate: `Subject: Extreme Nahaufnahme eines Details - zeige Qualität und Handwerkskunst.
Composition: Extreme close-up / Makro-Shot, Detail füllt den ganzen Frame.
Style: Makro-Produktfotografie, sichtbare Materialstruktur.
Lighting: Weiches Seitenlicht um Texturen hervorzuheben.`,
    style: 'macro',
    aspectRatio: '1:1',
  },
]

// Define Video Presets
const VIDEO_PRESETS = [
  {
    name: 'Product Teaser',
    description: 'Kurzer, dynamischer Produktteaser für Social Media',
    category: 'teaser',
    promptTemplate: `Scene: Dynamische Präsentation von [PRODUKTNAME] mit schnellen Schnitten.
Camera Movement: Smooth dolly movements, close-ups, revealing shots.
Style: Modern, energetic, professional product video.
Duration: 15 Sekunden, schnelle Schnitte alle 2-3 Sekunden.`,
    duration: 15,
    format: '9:16',
  },
  {
    name: 'Vorher/Nachher Transformation',
    description: 'Transformationsvideo mit Wischeffekt',
    category: 'beforeafter',
    promptTemplate: `Scene: Split-Screen oder Wisch-Übergang von Vorher zu Nachher Zustand.
Camera: Statische Kamera, identischer Bildausschnitt für beide Szenen.
Transition: Smooth wipe or morph transition in der Mitte.
Duration: 10 Sekunden - 5s Vorher, Transition, 5s Nachher.`,
    duration: 10,
    format: '1:1',
  },
  {
    name: 'Story Highlight',
    description: 'Vertikales Video für Instagram Stories',
    category: 'story',
    promptTemplate: `Scene: Dynamische Story-Sequenz mit [PRODUKTNAME].
Camera: Vertikales Format, schnelle Bewegungen, POV-Shots.
Style: Trendy, jung, Instagram-optimiert mit schnellen Übergängen.
Duration: 15 Sekunden, perfekt für Stories.`,
    duration: 15,
    format: '9:16',
  },
  {
    name: 'Tutorial Snippet',
    description: 'Kurzes How-To Video',
    category: 'tutorial',
    promptTemplate: `Scene: Schritt-für-Schritt Anleitung zur Nutzung von [PRODUKTNAME].
Camera: Overhead oder frontale Ansicht, klare Sicht auf Handlungen.
Style: Klar, informativ, leicht zu folgen.
Duration: 30 Sekunden, 3-4 klare Schritte.`,
    duration: 30,
    format: '1:1',
  },
  {
    name: 'Brand Intro',
    description: 'Kurze Markenvorstellung',
    category: 'brand',
    promptTemplate: `Scene: Cinematic introduction of the brand and its values.
Camera: Smooth, cinematic movements, wide establishing shots to close-ups.
Style: Premium, emotional, brand-focused storytelling.
Duration: 20 Sekunden, Logo-Reveal am Ende.`,
    duration: 20,
    format: '16:9',
  },
  {
    name: 'Unboxing Experience',
    description: 'Elegantes Auspackvideo',
    category: 'teaser',
    promptTemplate: `Scene: Elegantes Auspacken von [PRODUKTNAME] aus der Verpackung.
Camera: Close-ups auf Hände und Produkt, smooth reveals.
Style: ASMR-inspiriert, langsam, zufriedenstellend.
Duration: 20 Sekunden, Fokus auf Premium-Feeling.`,
    duration: 20,
    format: '9:16',
  },
]

async function seedPresets() {
  console.log('🌱 Seeding AI Presets...')

  // Seed Image Presets
  console.log('\n📸 Seeding Image Presets...')
  for (const preset of IMAGE_PRESETS) {
    try {
      const existing = await prisma.aiPreset.findFirst({
        where: {
          name: preset.name,
          userId: null,
          type: 'IMAGE',
        },
      })

      if (existing) {
        console.log(`  ⏭️  Skipping "${preset.name}" (already exists)`)
        continue
      }

      await prisma.aiPreset.create({
        data: {
          userId: null,
          name: preset.name,
          description: preset.description,
          type: 'IMAGE',
          category: preset.category,
          promptTemplate: preset.promptTemplate,
          style: preset.style,
          aspectRatio: preset.aspectRatio,
          isPublic: true,
          usageCount: 0,
        },
      })
      console.log(`  ✅ Created "${preset.name}"`)
    } catch (err) {
      console.log(`  ⚠️ Error creating "${preset.name}":`, err.message)
    }
  }

  // Seed Video Presets
  console.log('\n🎬 Seeding Video Presets...')
  for (const preset of VIDEO_PRESETS) {
    try {
      const existing = await prisma.aiPreset.findFirst({
        where: {
          name: preset.name,
          userId: null,
          type: 'VIDEO',
        },
      })

      if (existing) {
        console.log(`  ⏭️  Skipping "${preset.name}" (already exists)`)
        continue
      }

      await prisma.aiPreset.create({
        data: {
          userId: null,
          name: preset.name,
          description: preset.description,
          type: 'VIDEO',
          category: preset.category,
          promptTemplate: preset.promptTemplate,
          duration: preset.duration,
          aspectRatio: preset.format,
          isPublic: true,
          usageCount: 0,
        },
      })
      console.log(`  ✅ Created "${preset.name}"`)
    } catch (err) {
      console.log(`  ⚠️ Error creating "${preset.name}":`, err.message)
    }
  }

  console.log('\n✨ Seeding complete!')

  // Summary
  const imageCount = await prisma.aiPreset.count({
    where: { type: 'IMAGE', userId: null },
  })
  const videoCount = await prisma.aiPreset.count({
    where: { type: 'VIDEO', userId: null },
  })

  console.log(`\n📊 Summary:`)
  console.log(`   - ${imageCount} System Image Presets`)
  console.log(`   - ${videoCount} System Video Presets`)
}

seedPresets()
  .catch((error) => {
    console.error('❌ Error seeding presets:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

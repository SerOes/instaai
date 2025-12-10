/**
 * Complete Seed script for AI Presets (JavaScript version for Docker runtime)
 * Seeds ALL default IMAGE and VIDEO presets into the database
 * These are system presets (userId = null, isPublic = true)
 * 
 * Total: ~30 Image Presets + ~24 Video Presets
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ================== IMAGE PRESETS ==================
const IMAGE_PRESETS = [
  // === PRODUCT CATEGORY ===
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
    name: 'Hero Product Shot',
    description: 'Premium Hauptproduktbild für Website/Shop - maximale Qualität',
    category: 'product',
    promptTemplate: `Subject: Ein einzelnes [PRODUKTNAME] als Hero-Shot, absolut perfekt präsentiert.
Composition: Zentrierte, frontale Aufnahme mit leichtem Winkel, Produkt füllt 60-70% des Frames.
Style: Ultra-hochauflösende kommerzielle Produktfotografie, drei-Punkt-Beleuchtung, perfekte Reflexionen.
Camera: Medium shot, 85mm Objektiv-Look, leichte Perspektive von vorne-oben.
Lighting: Professionelles Studiolicht mit Softboxen, dezente Rim-Lights für Konturierung.`,
    style: 'premium',
    aspectRatio: '1:1',
  },
  {
    name: 'Produkt-Detail Makro',
    description: 'Extreme Nahaufnahme für Texturen, Nähte, Details',
    category: 'product',
    promptTemplate: `Subject: Extreme Nahaufnahme eines Details von [PRODUKTNAME] - zeige Qualität und Handwerkskunst.
Composition: Extreme close-up / Makro-Shot, Detail füllt den ganzen Frame, shallow depth of field.
Style: Makro-Produktfotografie, f/2.8 für selektive Schärfe, sichtbare Materialstruktur.
Camera: Makro-Objektiv-Look, sehr nah, Bokeh im Hintergrund.
Lighting: Weiches Seitenlicht um Texturen hervorzuheben.`,
    style: 'macro',
    aspectRatio: '1:1',
  },
  {
    name: 'Flat Lay Arrangement',
    description: 'Vogelperspektive auf arrangierte Produkte - perfekt für Produktgruppen',
    category: 'product',
    promptTemplate: `Subject: Mehrere [PRODUKTNAME] Produkte kunstvoll von oben arrangiert.
Composition: Vogelperspektive (top-down), symmetrische oder asymmetrische Anordnung, viel negativer Raum.
Location: Sauberer, texturierter Hintergrund (Marmor, Holz, Leinen oder einfarbig in Markenfarbe).
Style: Hochauflösende Flat-Lay-Fotografie, weiches diffuses Licht von oben, keine harten Schatten.`,
    style: 'realistic',
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
    name: 'Produkt-Kollektion',
    description: 'Mehrere Produkte/Varianten elegant arrangiert',
    category: 'product',
    promptTemplate: `Subject: Eine Kollektion von [PRODUKTNAME] in verschiedenen Farben oder Varianten, kunstvoll arrangiert.
Composition: Gruppenbild mit klarer Hierarchie, Hauptprodukt zentral, Varianten drumherum angeordnet.
Location: Premium Studio mit nahtlosem Hintergrund oder eleganter Oberfläche (Marmor, Holz).
Style: High-end Katalog-Fotografie, perfekte Abstände, harmonische Farbbalance.`,
    style: 'collection',
    aspectRatio: '16:9',
  },
  {
    name: 'Produkt mit Größenvergleich',
    description: 'Zeigt die tatsächliche Größe des Produkts im Kontext',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] neben bekannten Objekten für Größenkontext - Hand, Tasse, Stift, Münze.
Composition: Produkt im Zentrum mit Referenzobjekten, die die Größe verdeutlichen.
Style: Informativer Produktfoto-Stil, klar und verständlich, gute Beleuchtung.
Lighting: Helles, gleichmäßiges Licht ohne ablenkende Schatten.`,
    style: 'informative',
    aspectRatio: '1:1',
  },
  {
    name: 'Produkt mit Verpackung',
    description: 'Zeigt Produkt und Originalverpackung zusammen',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] elegant neben oder vor seiner Verpackung präsentiert.
Composition: Produkt leicht im Vordergrund, Verpackung dahinter oder daneben, beide gut sichtbar.
Location: Premium Oberfläche - Holz, Marmor oder sauberer Gradient-Hintergrund.
Style: Unboxing-Ready Look, premium, einladend, professionelle Produktfotografie.`,
    style: 'premium',
    aspectRatio: '4:5',
  },
  {
    name: 'Schwebendes Produkt',
    description: 'Dynamischer Look mit schwebendem Produkt und Schatten',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] schwebt elegant in der Luft mit realistischem Schatten darunter.
Composition: Produkt zentriert, schwebt ca. 20cm über einer Oberfläche, perfekter Schatten darunter.
Style: Moderner E-Commerce Style, clean, dynamisch, eye-catching.
Lighting: Drei-Punkt-Beleuchtung, Hauptlicht von oben, Schatten weich aber definiert.`,
    style: 'dynamic',
    aspectRatio: '1:1',
  },
  {
    name: 'Produkt 3/4 Ansicht',
    description: 'Klassische 3/4 Ansicht zeigt Vorder- und Seitenansicht',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] in klassischer 3/4 Ansicht - zeigt sowohl Front als auch Seite.
Composition: Produkt im 45° Winkel gedreht, Front und eine Seite sichtbar.
Location: Nahtloser Hintergrund in neutraler Farbe.
Style: Klassische kommerzielle Produktfotografie, zeitlos, professionell.`,
    style: 'classic',
    aspectRatio: '1:1',
  },
  {
    name: 'Produkt auf Weiß',
    description: 'Klassisches E-Commerce Foto auf reinweißem Hintergrund',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] freigestellt auf absolut reinem Weiß (#FFFFFF Hintergrund).
Composition: Produkt zentriert, genug Rand rundherum, perfekt für E-Commerce Listings.
Style: Amazon/eBay/Shop-ready, clean, professionell, hohe Auflösung.
Lighting: Helles, schattenfreies Licht, Produkt vollständig ausgeleuchtet.`,
    style: 'ecommerce',
    aspectRatio: '1:1',
  },
  {
    name: 'Geschenkverpackung',
    description: 'Produkt als liebevoll verpacktes Geschenk präsentiert',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] schön verpackt als Geschenk mit Schleife und Dekoration.
Composition: Geschenk im Zentrum, leicht schräger Winkel, umgeben von Verpackungsmaterial.
Location: Festlicher, einladender Hintergrund - Tisch mit Konfetti, Blumen oder saisonaler Deko.
Style: Warm, einladend, festlich, hochwertige Produktfotografie mit Lifestyle-Touch.`,
    style: 'realistic',
    aspectRatio: '4:5',
  },
  {
    name: 'Instagram-Ready Produkt',
    description: 'Optimiert für Instagram Feed mit perfektem Cropping',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] perfekt für Instagram optimiert mit trendiger Ästhetik.
Composition: Instagram-optimiertes 1:1 oder 4:5 Format, Produkt perfekt im Frame.
Location: Trendy, Instagram-worthy Hintergrund - Terrazzo, bunter Gradient, oder minimalistisch clean.
Style: Social-Media-Native Look, leicht entsättigte Farben oder warme Töne, modern und ansprechend.`,
    style: 'instagram',
    aspectRatio: '1:1',
  },

  // === LIFESTYLE CATEGORY ===
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
    name: 'Behind the Scenes',
    description: 'Authentische Einblicke in den Arbeitsprozess',
    category: 'lifestyle',
    promptTemplate: `Subject: Hände bei der Arbeit an [PRODUKTNAME], Werkzeuge und Materialien sichtbar.
Composition: Natürlicher, leicht schräger Winkel, Fokus auf die Handarbeit, unscharfer Hintergrund.
Action: Aktive Arbeit - nähen, basteln, malen, verpacken oder gestalten.
Location: Authentischer Arbeitsplatz mit natürlichem Licht.
Style: Dokumentarisch-authentischer Look, warme Farbtöne, natürliches Tageslicht.`,
    style: 'realistic',
    aspectRatio: '4:5',
  },
  {
    name: 'Produkt in Benutzung',
    description: 'Zeigt das Produkt während der aktiven Nutzung',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] wird aktiv von einer Person benutzt - zeige den praktischen Nutzen.
Composition: Medium shot, Person und Produkt beide sichtbar, natürlicher Blickwinkel.
Action: Aktive, natürliche Nutzung des Produkts - greifen, halten, verwenden, interagieren.
Location: Passende Alltagsumgebung zur Zielgruppe.
Style: Lifestyle-Fotografie mit dokumentarischem Touch, authentisch, nicht gestellt wirkend.`,
    style: 'lifestyle',
    aspectRatio: '4:5',
  },
  {
    name: 'Lifestyle Tisch-Szene',
    description: 'Produkt auf einem stilvollen Tisch mit passenden Accessoires',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] als Teil einer kurierten Tisch-Szene mit passenden Lifestyle-Accessoires.
Composition: Produkt als Hauptelement, umgeben von thematisch passenden Objekten (Pflanzen, Bücher, Kaffee, etc.).
Location: Stilvoller Tisch oder Arbeitsfläche in einer einladenden Umgebung.
Style: Instagram-worthy Lifestyle-Flatlay oder erhöhte Tischperspektive, warm und einladend.`,
    style: 'lifestyle',
    aspectRatio: '1:1',
  },

  // === STORY CATEGORY ===
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

  // === CAROUSEL CATEGORY ===
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

  // === BRAND CATEGORY ===
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
    name: 'Seasonal Mood',
    description: 'Saisonales Stimmungsbild mit Produkt',
    category: 'brand',
    promptTemplate: `Subject: [PRODUKTNAME] eingebettet in saisonale Dekoration und Stimmung.
Composition: Produkt im Vordergrund, saisonale Elemente als Rahmen und Hintergrund.
Location: Passend zur Saison - Herbstlaub, Weihnachtsdeko, Frühlingsblumen oder Sommervibes.
Style: Stimmungsvolle, warme Fotografie mit saisonaler Farbpalette, Bokeh-Effekte.`,
    style: 'realistic',
    aspectRatio: '1:1',
  },
  {
    name: 'Kunden-Testimonial',
    description: 'Zitat mit Kundenfoto-Platzhalter für Social Proof',
    category: 'brand',
    promptTemplate: `Subject: Stilisierter Testimonial-Frame mit Platzhalter für Kundenfoto.
Composition: Kundenbereich (Foto/Avatar) links oder oben, Zitat-Bereich rechts oder unten.
Location: Dezenter, eleganter Hintergrund in Markenfarben mit subtilen Mustern.
Style: Modern, clean, vertrauensbildend, professionelles Social-Proof-Design.
Text im Bild: "[ZITAT]" - [KUNDENNAME] ⭐⭐⭐⭐⭐`,
    style: 'minimal',
    aspectRatio: '1:1',
  },
  {
    name: 'Ankündigungs-Banner',
    description: 'Aufmerksamkeitsstarkes Banner für Sales, Launches oder News',
    category: 'brand',
    promptTemplate: `Subject: Bold typografisches Design mit starker Hauptbotschaft.
Composition: Zentriert oder asymmetrisch, klare visuelle Hierarchie, Headline dominant.
Location: Abstrakter Hintergrund mit Farbverlauf oder geometrischen Formen in Markenfarben.
Style: Modern, bold, eye-catching, hoher Kontrast, klare Lesbarkeit.
Text im Bild: "[HAUPTBOTSCHAFT]" groß, "[DETAILS/DATUM]" kleiner darunter.`,
    style: 'modern',
    aspectRatio: '1:1',
  },
  {
    name: 'Frühlings-Produktszene',
    description: 'Produkt in frischer Frühlingsatmosphäre',
    category: 'brand',
    promptTemplate: `Subject: [PRODUKTNAME] umgeben von frischen Frühlingsblumen und hellem, frischem Ambiente.
Composition: Produkt im Vordergrund, Frühlingsblumen (Tulpen, Narzissen, Kirschblüten) als Rahmen.
Location: Heller, luftiger Hintergrund mit natürlichem Licht und Frühlingsdekor.
Style: Frische, lebendige Frühlingsfarben, Pastelle und Weiß dominant, optimistische Stimmung.`,
    style: 'seasonal',
    aspectRatio: '1:1',
  },

  // === PORTRAIT/ENHANCEMENT CATEGORY ===
  {
    name: 'Portrait Verbesserung',
    description: 'Verbessere Beleuchtung, Hauttöne und Hintergrund eines Portraits',
    category: 'portrait',
    promptTemplate: `Editing Instructions: Verbessere dieses Portrait-Foto:
- Optimiere die Hautbeleuchtung für einen natürlichen, schmeichelhaften Look
- Balanciere Hauttöne für ein gesundes, warmes Erscheinungsbild
- Verstärke Augendetails für mehr Ausdruckskraft
- Verbessere den Hintergrund für einen professionelleren Look
Style: Professionelle Portrait-Retusche, natürlich, nicht übertrieben.`,
    style: 'enhancement',
    aspectRatio: '4:5',
  },
  {
    name: 'Portrait Hintergrund ändern',
    description: 'Ersetze den Hintergrund durch professionellen Studio-Look',
    category: 'portrait',
    promptTemplate: `Editing Instructions: Ersetze den Hintergrund dieses Portraits:
- Nahtloser Gradient-Hintergrund in neutralem Grau oder warmem Beige
- Sanfter Vignetten-Effekt Richtung Ränder
- Perfekte Kantentrennung zwischen Person und Hintergrund
Style: Professionelles Studio-Portrait, clean und zeitlos.`,
    style: 'studio',
    aspectRatio: '4:5',
  },
  {
    name: 'Business Headshot',
    description: 'Transformiere ein Foto in ein professionelles Business-Portrait',
    category: 'portrait',
    promptTemplate: `Editing Instructions: Transformiere dieses Foto in ein professionelles Business-Headshot:
- Professioneller, neutraler Hintergrund (Grau oder Navy-Gradient)
- Business-appropriate Beleuchtung mit professionellen Catchlights in den Augen
- Subtile Hautverbesserung für sauberen, professionellen Look
- LinkedIn/Corporate Website-ready Qualität
Style: Corporate Headshot, vertrauenserweckend, kompetent.`,
    style: 'business',
    aspectRatio: '1:1',
  },
  {
    name: 'Künstlerisches Portrait',
    description: 'Verwandle ein Foto in ein stilisiertes, künstlerisches Portrait',
    category: 'portrait',
    promptTemplate: `Editing Instructions: Transformiere dieses Portrait in ein künstlerisches, stilisiertes Bild:
- Wähle einen einzigartigen künstlerischen Stil (inspiriert von klassischer Malerei)
- Behalte die erkennbare Ähnlichkeit der Person
- Verstärke dramatische Beleuchtung und Kontraste
- Füge künstlerische Textur oder Pinselstrich-Effekte hinzu
Style: Künstlerisches Portrait, expressiv, einzigartig, gallery-worthy.`,
    style: 'artistic',
    aspectRatio: '4:5',
  },
  {
    name: 'Portrait Beleuchtung korrigieren',
    description: 'Korrigiere schlechte Beleuchtung in einem Portrait',
    category: 'portrait',
    promptTemplate: `Editing Instructions: Korrigiere die Beleuchtung in diesem Portrait:
- Entferne harte Schatten unter Augen und Nase
- Gleiche überbelichtete oder unterbelichtete Bereiche aus
- Füge sanftes Fill-Light hinzu wo nötig
- Erstelle schmeichelhafte Catchlights in den Augen
Style: Natürliche, schmeichelhafte Porträtbeleuchtung.`,
    style: 'correction',
    aspectRatio: '4:5',
  },
]

// ================== VIDEO PRESETS ==================
const VIDEO_PRESETS = [
  // === TEASER CATEGORY ===
  {
    name: 'Produkt-Reveal',
    description: 'Dramatische Enthüllung mit Spannung und Impact',
    category: 'teaser',
    promptTemplate: `Cinematography: Start with a tight close-up on a mysterious shadow, slowly pulling back to reveal [PRODUKTNAME] in full glory.
Subject: [PRODUKTNAME] as the star, emerging from darkness or unveiling dramatically.
Action: Slow reveal building anticipation - shadow to light transition.
Style & Ambiance: Cinematic, dramatic lighting, high contrast, premium commercial feel.
Audio: Building tension music, dramatic reveal sound.`,
    duration: 6,
    format: '9:16',
  },
  {
    name: 'Coming Soon',
    description: 'Geheimnisvoller Teaser für neue Produkte',
    category: 'teaser',
    promptTemplate: `Cinematography: Quick cuts between abstract shapes, blurred product glimpses, typography reveals.
Subject: Hints of [PRODUKTNAME] - partial views, silhouettes, colors, textures without full reveal.
Action: Fleeting glimpses, quick zooms, mysterious movements creating curiosity.
Style & Ambiance: Mysterious, intriguing, premium. Deep shadows, strategic lighting.
Text Overlay: "COMING SOON" reveal at the end.`,
    duration: 5,
    format: '9:16',
  },
  {
    name: 'Launch-Countdown',
    description: 'Countdown-Animation für Produktlaunches',
    category: 'teaser',
    promptTemplate: `Cinematography: Dynamic countdown sequence with energetic transitions between numbers.
Subject: Bold countdown numbers (3, 2, 1) transitioning to [PRODUKTNAME] reveal.
Action: Numbers animate in dramatically, product appears on final beat.
Style & Ambiance: Exciting, urgent, celebratory. High energy, bold graphics.
Audio: Building beat drops on each number, explosive sound on reveal.`,
    duration: 5,
    format: '9:16',
  },
  {
    name: 'Feature-Spotlight',
    description: 'Ein besonderes Feature dramatisch hervorheben',
    category: 'teaser',
    promptTemplate: `Cinematography: Extreme close-up on [FEATURE] with slow pull to context shot.
Subject: Specific feature or detail of [PRODUKTNAME] - texture, mechanism, unique element.
Action: Macro detail shot, slow rotation to show 3D quality, zoom out to full product.
Style & Ambiance: Technical but beautiful, Apple-style product photography.
Audio: Subtle ambient tones, soft mechanical sounds.`,
    duration: 4,
    format: '9:16',
  },
  {
    name: 'Flash Sale',
    description: 'Dringliche Sale-Ankündigung mit Countdown',
    category: 'teaser',
    promptTemplate: `Cinematography: Fast-paced cuts, pulsing zoom effects, flashing elements creating urgency.
Subject: [PRODUKTNAME] with bold sale percentage, countdown timer graphic.
Action: Products flash on screen, prices slash dramatically, timer ticks down.
Style & Ambiance: URGENT, exciting, can't-miss energy. High contrast, bold typography.
Audio: Urgent ticking clock, whoosh sounds, bass drops.
Text Overlay: "FLASH SALE", percentage off, "ENDS SOON".`,
    duration: 5,
    format: '9:16',
  },

  // === BEFORE/AFTER CATEGORY ===
  {
    name: 'Transformation Split',
    description: 'Side-by-side Vorher/Nachher Vergleich',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Split-screen composition, before on left, after on right, with satisfying wipe transition.
Subject: Same [PRODUKTNAME] or scenario in two states - before and after.
Action: Synchronized camera movement on both sides, wipe reveals the difference dramatically.
Style & Ambiance: Clean, documentary-style, satisfying transformation reveal.
Audio: Soft ambient music, satisfying "whoosh" on the wipe transition.
Text Overlay: "VORHER" on left, "NACHHER" on right.`,
    duration: 6,
    format: '9:16',
  },
  {
    name: 'Progress-Timelapse',
    description: 'Zeitraffer einer Transformation/Entwicklung',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Timelapse sequence showing gradual transformation over time.
Subject: [PRODUKTNAME] or result changing progressively from start to finish state.
Action: Smooth timelapse of improvement, growth, or transformation process.
Style & Ambiance: Documentary feel, satisfying progression, inspiring transformation.
Audio: Uplifting progression music, subtle time-passing sounds.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Makeover-Reveal',
    description: 'Dramatischer Makeover mit Spannungsaufbau',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Build anticipation with "before" shots, dramatic pause, then stunning "after" reveal.
Subject: Person or object before and after using [PRODUKTNAME] - dramatic improvement.
Action: Show underwhelming "before", building music, dramatic reveal of beautiful "after".
Style & Ambiance: Reality TV makeover energy, dramatic, feel-good, inspiring.
Audio: Building suspense music, dramatic pause, triumphant reveal music.
Text Overlay: "THE TRANSFORMATION" at reveal.`,
    duration: 8,
    format: '9:16',
  },

  // === STORY CATEGORY ===
  {
    name: 'Day in the Life',
    description: 'Mini-Vlog mit Produkt im Alltag',
    category: 'story',
    promptTemplate: `Cinematography: POV and third-person mix, authentic handheld movement, natural transitions.
Subject: Person going through their day naturally using [PRODUKTNAME] at key moments.
Action: Morning routine, work/activity, break time, evening - product integrated naturally.
Style & Ambiance: Authentic, relatable, warm, golden-hour lighting when possible.
Audio: Trendy background music, ASMR moments when using product.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Behind the Scenes Video',
    description: 'Authentischer Einblick hinter die Kulissen',
    category: 'story',
    promptTemplate: `Cinematography: Documentary-style, raw and authentic, candid moments captured naturally.
Subject: The making process of [PRODUKTNAME] - workshop, studio, creative process.
Action: Hands working, team collaborating, mistakes and wins, real moments.
Style & Ambiance: Honest, transparent, humanizing the brand, documentary feel.
Audio: Natural ambient sounds, optional soft music.
Text Overlay: "BEHIND THE SCENES" intro.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Quick-Tip',
    description: 'Schneller Hack oder Tipp in unter 10 Sekunden',
    category: 'story',
    promptTemplate: `Cinematography: Fast-paced, punchy cuts, get straight to the point.
Subject: Quick demonstration of a useful tip using [PRODUKTNAME].
Action: Problem shown briefly, solution demonstrated quickly, result shown.
Style & Ambiance: Informative, valuable, shareable, no fluff content.
Audio: Upbeat, short music loop, satisfying sound effects.
Text Overlay: "QUICK TIP" hook, "SAVE THIS" call-to-action.`,
    duration: 5,
    format: '9:16',
  },
  {
    name: 'Unboxing Experience',
    description: 'ASMR-style Unboxing für maximale Satisfaktion',
    category: 'story',
    promptTemplate: `Cinematography: Close-up focus on hands and packaging, slow deliberate movements, ASMR quality.
Subject: Hands carefully unboxing [PRODUKTNAME], revealing layers and details.
Action: Slow, intentional unboxing - opening, unwrapping, discovering, admiring.
Style & Ambiance: Satisfying, premium, ASMR-like, sensory experience.
Audio: ASMR sounds - paper crinkling, box opening. Soft ambient music.
Text Overlay: "UNBOX WITH ME" intro.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Get Ready With Me',
    description: 'GRWM Format mit Produktintegration',
    category: 'story',
    promptTemplate: `Cinematography: Selfie-style perspective, mirror shots, personal and intimate feel.
Subject: Person getting ready for their day/event, using [PRODUKTNAME] as part of routine.
Action: Step-by-step getting ready process, product integrated naturally.
Style & Ambiance: Personal, intimate, relatable, influencer-style content.
Audio: Chatty voiceover or trending music, ASMR application sounds.
Text Overlay: "GRWM" intro, product callouts.`,
    duration: 8,
    format: '9:16',
  },

  // === TUTORIAL CATEGORY ===
  {
    name: 'Step-by-Step Guide',
    description: 'Nummerierte Anleitung mit klaren Schritten',
    category: 'tutorial',
    promptTemplate: `Cinematography: Clear, well-lit shots of each step, numbered sequence, clean transitions.
Subject: Step-by-step demonstration of using [PRODUKTNAME] correctly.
Action: Each step clearly shown - Step 1, Step 2, Step 3 - with focus on the action.
Style & Ambiance: Educational, clear, professional but approachable, helpful.
Audio: Clear background music, optional voiceover, step transition sounds.
Text Overlay: Step numbers prominently displayed, key instructions as text.`,
    duration: 10,
    format: '9:16',
  },
  {
    name: 'How-To Quick',
    description: 'Schnelle How-To Anleitung unter 30 Sekunden',
    category: 'tutorial',
    promptTemplate: `Cinematography: Fast-paced but clear, essential steps only, punchy editing.
Subject: Quick demonstration of how to use [PRODUKTNAME] effectively.
Action: Problem → Solution → Result in rapid succession.
Style & Ambiance: Efficient, valuable, TikTok-native pacing, no wasted time.
Audio: Trending audio or upbeat music, satisfying sound on completion.
Text Overlay: "HOW TO" hook, key steps as quick text, "DONE!" ending.`,
    duration: 6,
    format: '9:16',
  },
  {
    name: 'DIY Tutorial',
    description: 'Do-It-Yourself Anleitung mit Ergebnis',
    category: 'tutorial',
    promptTemplate: `Cinematography: Process-focused shots, hands-on crafting, satisfying progression.
Subject: Creating or customizing something using [PRODUKTNAME].
Action: Materials shown, process demonstrated, beautiful result revealed.
Style & Ambiance: Creative, inspiring, achievable, satisfying crafting content.
Audio: Crafting ASMR sounds, soft background music, satisfying completion sound.
Text Overlay: Materials list, key technique tips, "YOU MADE THIS!" at end.`,
    duration: 10,
    format: '9:16',
  },
  {
    name: 'Rezept-Video',
    description: 'Food-Content mit Schritt-für-Schritt Kochen',
    category: 'tutorial',
    promptTemplate: `Cinematography: Appetizing food shots, overhead cooking perspective, sizzling action shots.
Subject: Cooking or preparing [REZEPT] with focus on delicious results.
Action: Ingredients prep, cooking process, plating, final beauty shot.
Style & Ambiance: Mouth-watering, warm, homey, food-porn aesthetic.
Audio: Cooking ASMR (sizzling, chopping), soft music.
Text Overlay: Recipe name, ingredient callouts, cooking tips, "BON APPÉTIT" ending.`,
    duration: 10,
    format: '9:16',
  },

  // === BRAND CATEGORY ===
  {
    name: 'Über Uns',
    description: 'Emotionale Markengeschichte in Kurzform',
    category: 'brand',
    promptTemplate: `Cinematography: Cinematic brand film style, emotional storytelling, professional production value.
Subject: The story of [MARKE] - founding, mission, values, people behind the brand.
Action: Founder/team moments, product creation, customer impact, brand journey.
Style & Ambiance: Emotional, inspiring, authentic, premium brand documentary.
Audio: Emotional brand music, optional founder voiceover, inspiring soundtrack.
Text Overlay: Brand name, founding year, mission statement, "OUR STORY" intro.`,
    duration: 10,
    format: '9:16',
  },
  {
    name: 'Team-Vorstellung',
    description: 'Meet the Team Vorstellungsvideo',
    category: 'brand',
    promptTemplate: `Cinematography: Individual portraits transitioning between team members, friendly and approachable.
Subject: Team members of [MARKE] - faces, names, roles, personalities.
Action: Each person waves, smiles, does a signature gesture, or says one line.
Style & Ambiance: Friendly, professional, human, welcoming, diverse.
Audio: Upbeat, friendly music, optional quick audio intros from each person.
Text Overlay: Name and role for each person, "MEET THE TEAM" intro.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Firmenkultur',
    description: 'Workplace Culture und Teamspirit zeigen',
    category: 'brand',
    promptTemplate: `Cinematography: Documentary-style candid moments, office life, team interactions.
Subject: Day in the life at [MARKE] - workspace, collaboration, fun moments, work ethic.
Action: Team meetings, creative sessions, lunch together, celebrations, focused work.
Style & Ambiance: Authentic, energetic, inviting, "we're hiring" energy.
Audio: Upbeat company culture music, ambient office sounds, laughter.
Text Overlay: "LIFE AT [MARKE]" intro, culture value highlights.`,
    duration: 8,
    format: '9:16',
  },
  {
    name: 'Kunden-Testimonial Video',
    description: 'Echte Kundenstimme als Video-Review',
    category: 'brand',
    promptTemplate: `Cinematography: Interview-style with customer, intercut with product/result shots.
Subject: Real customer sharing their experience with [PRODUKTNAME].
Action: Customer speaking authentically, showing product, demonstrating results.
Style & Ambiance: Authentic, trustworthy, relatable, social proof.
Audio: Customer voice clear and prominent, subtle background music.
Text Overlay: Customer name/location, key quote highlight, star rating.`,
    duration: 10,
    format: '9:16',
  },
  {
    name: 'Produkt-Lifestyle Film',
    description: 'Aspirational Lifestyle mit Produkt im Fokus',
    category: 'brand',
    promptTemplate: `Cinematography: High-end commercial style, aspirational lifestyle, beautiful cinematography.
Subject: [PRODUKTNAME] integrated into a desirable, aspirational lifestyle.
Action: Beautiful people using product naturally in stunning environments.
Style & Ambiance: Luxury, aspirational, dream-life aesthetic, commercial quality.
Audio: Premium brand music, cinematic soundtrack, lifestyle sounds.
Text Overlay: Minimal - brand logo subtle, tagline at end.`,
    duration: 8,
    format: '16:9',
  },
  {
    name: 'Mood Film',
    description: 'Atmosphärisches Stimmungsvideo ohne harten Verkauf',
    category: 'brand',
    promptTemplate: `Cinematography: Slow, dreamy, atmospheric shots focused on feeling rather than information.
Subject: [PRODUKTNAME] as part of a mood, feeling, aesthetic rather than feature focus.
Action: Slow, contemplative movements, light play, textures, abstract beauty.
Style & Ambiance: Artistic, moody, evocative, brand-feeling rather than brand-telling.
Audio: Atmospheric ambient music, nature sounds, artistic soundscape.
Text Overlay: Minimal or none - mood speaks for itself. Brand logo only.`,
    duration: 6,
    format: '9:16',
  },
  {
    name: 'Natur-Produktszene',
    description: 'Produkt in atemberaubender Naturkulisse',
    category: 'brand',
    promptTemplate: `Cinematography: Epic nature footage with product elegantly placed within the scene.
Subject: [PRODUKTNAME] in a breathtaking natural environment - mountains, ocean, forest.
Action: Nature in motion (waves, wind, clouds), product as beautiful element within.
Style & Ambiance: Epic, beautiful, eco-conscious, adventure or peace.
Audio: Nature sounds prominent, subtle cinematic music, wind/water sounds.
Text Overlay: Minimal - brand tagline about nature/sustainability.`,
    duration: 8,
    format: '16:9',
  },
  {
    name: 'Urban Vibes',
    description: 'Städtische Ästhetik mit Street-Style Energie',
    category: 'brand',
    promptTemplate: `Cinematography: Street-level urban footage, city energy, modern metropolitan vibes.
Subject: [PRODUKTNAME] as part of urban life - city streets, subways, rooftops, cafés.
Action: City life in motion, people walking, traffic, urban rhythm with product naturally present.
Style & Ambiance: Modern, energetic, street-style, contemporary, gen-z appeal.
Audio: Urban beats, city sounds, modern music, traffic and people ambient.
Text Overlay: City name, street-style typography, brand presence subtle but cool.`,
    duration: 8,
    format: '9:16',
  },
]

async function seedPresets() {
  console.log('🌱 Seeding ALL AI Presets...')
  console.log(`   - ${IMAGE_PRESETS.length} Image Presets to seed`)
  console.log(`   - ${VIDEO_PRESETS.length} Video Presets to seed`)

  let imageCreated = 0
  let imageSkipped = 0
  let videoCreated = 0
  let videoSkipped = 0

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
        imageSkipped++
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
      imageCreated++
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
        videoSkipped++
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
      videoCreated++
      console.log(`  ✅ Created "${preset.name}"`)
    } catch (err) {
      console.log(`  ⚠️ Error creating "${preset.name}":`, err.message)
    }
  }

  console.log('\n✨ Seeding complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Image Presets: ${imageCreated} created, ${imageSkipped} skipped (already exist)`)
  console.log(`   - Video Presets: ${videoCreated} created, ${videoSkipped} skipped (already exist)`)

  // Final count
  const totalImage = await prisma.aiPreset.count({ where: { type: 'IMAGE', userId: null } })
  const totalVideo = await prisma.aiPreset.count({ where: { type: 'VIDEO', userId: null } })
  console.log(`\n📈 Total in Database:`)
  console.log(`   - ${totalImage} System Image Presets`)
  console.log(`   - ${totalVideo} System Video Presets`)
}

seedPresets()
  .catch((error) => {
    console.error('❌ Error seeding presets:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

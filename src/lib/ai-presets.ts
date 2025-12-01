// AI Presets for Image and Video Generation
// Based on Nano Banana Pro and Veo 3.1 Guidelines

export interface ImagePreset {
  id: string
  name: string
  description: string
  category: 'product' | 'lifestyle' | 'story' | 'carousel' | 'brand'
  promptTemplate: string
  style: string
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9'
  tags: string[]
}

export interface VideoPreset {
  id: string
  name: string
  description: string
  category: 'teaser' | 'beforeafter' | 'story' | 'tutorial' | 'brand'
  promptTemplate: string
  duration: number // in seconds
  format: '9:16' | '16:9' | '1:1'
  audioType: 'music' | 'ambient' | 'none' | 'dialog'
  tags: string[]
}

// ================== IMAGE PRESETS ==================

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'clean-product-shot',
    name: 'Clean Product Shot',
    description: 'Freigestelltes Produkt, neutraler Hintergrund, Instagram-Feed',
    category: 'product',
    promptTemplate: `Subject: Ein einzelnes [PRODUKTNAME] steht im Vordergrund.
Composition: Frontale, mittlere Aufnahme, Produkt zentriert im Bild, viel Weißraum rundherum.
Action: Keine Aktion, das Produkt steht ruhig.
Location: Vor einem einfachen, sauberen Hintergrund mit sanftem Verlauf.
Style: Hochauflösende, fotorealistische Produktfotografie, weiches Studiolicht, sehr weiche Schatten.
Markenbezug: Nutze subtile Akzentfarben aus der Marke, kein zusätzliches Deko-Chaos.`,
    style: 'realistic',
    aspectRatio: '1:1',
    tags: ['product', 'minimal', 'clean', 'professional'],
  },
  {
    id: 'story-slide-minimal',
    name: 'Story-Slide Minimal',
    description: 'Viel Weißraum, kurze Headline, Logo - perfekt für Instagram Stories',
    category: 'story',
    promptTemplate: `Subject: Flacher Hintergrund und ein zentrales Icon oder kleines Produktfoto.
Composition: Hochformat 9:16, viel freier Raum, das Icon oder Produkt im oberen Drittel.
Action: Keine Aktion, statisch.
Location: Abstrakter, cleaner Hintergrund in Markenfarbe.
Style: Minimalistischer Grafikstil, klare Flächen, keine Texturen, weiche Schatten.
Markenbezug: Verwende die primären Markenfarben und das Marken-Logo klein unten.
Text im Bild: Große Headline in der Mitte in einer gut lesbaren, fetten Sans-Serif-Schrift.`,
    style: 'minimal',
    aspectRatio: '9:16',
    tags: ['story', 'minimal', 'headline', 'branding'],
  },
  {
    id: 'carousel-infographic',
    name: 'Karussell Infografik',
    description: 'Strukturierte Info mit Icons - ideal für Karussell-Posts',
    category: 'carousel',
    promptTemplate: `Subject: Informative Grafik mit klaren Abschnitten und Icons.
Composition: Quadratisches Format 1:1, klare visuelle Hierarchie, Nummerierung oder Punkte.
Action: Statisch, informationsvermittelnd.
Location: Sauberer Hintergrund mit subtilen Mustern oder Farbverläufen.
Style: Modern infographic design, flat icons, clear typography, professional look.
Markenbezug: Markenfarben als Akzente, konsistente Iconografie.
Layout: Mehrere klar abgegrenzte Informationsblöcke mit Icons und kurzen Texten.`,
    style: 'modern',
    aspectRatio: '1:1',
    tags: ['carousel', 'infographic', 'educational', 'icons'],
  },
  {
    id: 'lifestyle-product-scene',
    name: 'Lifestyle Product Scene',
    description: 'Produkt in realer Umgebung - authentisch und lebensnah',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] in einer natürlichen Alltagsszene.
Composition: Natürliche, leicht asymmetrische Komposition, Produkt im Vordergrund aber integriert in die Szene.
Action: Subtile Interaktion - jemand greift nach dem Produkt oder nutzt es beiläufig.
Location: Gemütliche, einladende Umgebung passend zur Zielgruppe (Küche, Wohnzimmer, Café, etc.).
Style: Warme, natürliche Fotografie mit weichem Tageslicht, authentische Atmosphäre.
Markenbezug: Produkt steht im Mittelpunkt, aber harmonisch in die Szene integriert.`,
    style: 'realistic',
    aspectRatio: '4:5',
    tags: ['lifestyle', 'authentic', 'warm', 'natural'],
  },
  {
    id: 'quote-template',
    name: 'Zitat-Template',
    description: 'Elegantes Zitat-Design für motivierende Posts',
    category: 'brand',
    promptTemplate: `Subject: Typografisches Design mit einem inspirierenden Zitat.
Composition: Zentriertes Layout mit großzügigem Rand, Zitat im Fokus.
Action: Statisch, text-fokussiert.
Location: Eleganter Hintergrund mit subtiler Textur oder Farbverlauf.
Style: Typografisch, elegant, lesbar, harmonische Schriftpaarung.
Markenbezug: Markenfarben, Logo dezent platziert.
Text im Bild: "[ZITAT]" - [AUTOR] in eleganter Typografie.`,
    style: 'minimal',
    aspectRatio: '1:1',
    tags: ['quote', 'typography', 'motivational', 'brand'],
  },
  {
    id: 'before-after-split',
    name: 'Vorher/Nachher Split',
    description: 'Split-Screen Design für Transformationen',
    category: 'product',
    promptTemplate: `Subject: Zwei kontrastierende Ansichten - links "Vorher", rechts "Nachher".
Composition: Vertikale Teilung des Bildes 50/50, klare Trennlinie oder sanfter Übergang.
Action: Statischer Vergleich.
Location: Identische Umgebung auf beiden Seiten für maximalen Effekt.
Style: Klarer, deutlicher Unterschied zwischen den beiden Hälften, professionelle Qualität.
Markenbezug: Logo oder Wasserzeichen dezent in einer Ecke.
Text im Bild: "VORHER" und "NACHHER" Labels.`,
    style: 'realistic',
    aspectRatio: '1:1',
    tags: ['before-after', 'transformation', 'comparison', 'results'],
  },
  // ========== NEW IMAGE PRESETS ==========
  {
    id: 'flat-lay-arrangement',
    name: 'Flat Lay Arrangement',
    description: 'Vogelperspektive auf arrangierte Produkte - perfekt für Produktgruppen',
    category: 'product',
    promptTemplate: `Subject: Mehrere [PRODUKTNAME] Produkte kunstvoll von oben arrangiert.
Composition: Vogelperspektive (top-down), symmetrische oder asymmetrische Anordnung, viel negativer Raum.
Action: Statisch, perfekt arrangiert.
Location: Sauberer, texturierter Hintergrund (Marmor, Holz, Leinen oder einfarbig in Markenfarbe).
Style: Hochauflösende Flat-Lay-Fotografie, weiches diffuses Licht von oben, keine harten Schatten.
Markenbezug: Farben und Dekoelemente passend zur Marke, optional kleine Props.
Text im Bild: Optional - Produktname oder Slogan dezent am Rand.`,
    style: 'realistic',
    aspectRatio: '1:1',
    tags: ['flat-lay', 'arrangement', 'multiple-products', 'overhead'],
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind the Scenes',
    description: 'Authentische Einblicke in den Arbeitsprozess',
    category: 'lifestyle',
    promptTemplate: `Subject: Hände bei der Arbeit an [PRODUKTNAME], Werkzeuge und Materialien sichtbar.
Composition: Natürlicher, leicht schräger Winkel, Fokus auf die Handarbeit, unscharfer Hintergrund.
Action: Aktive Arbeit - nähen, basteln, malen, verpacken oder gestalten.
Location: Authentischer Arbeitsplatz mit natürlichem Licht, leichte Unordnung erlaubt.
Style: Dokumentarisch-authentischer Look, warme Farbtöne, natürliches Tageslicht.
Markenbezug: Markentypische Materialien und Farben subtil im Bild.
Text im Bild: Keiner oder sehr dezent "Made with ❤️".`,
    style: 'realistic',
    aspectRatio: '4:5',
    tags: ['bts', 'authentic', 'handmade', 'process', 'crafting'],
  },
  {
    id: 'seasonal-mood',
    name: 'Seasonal Mood',
    description: 'Saisonales Stimmungsbild mit Produkt',
    category: 'brand',
    promptTemplate: `Subject: [PRODUKTNAME] eingebettet in saisonale Dekoration und Stimmung.
Composition: Produkt im Vordergrund, saisonale Elemente als Rahmen und Hintergrund.
Action: Statisch, atmosphärisch.
Location: Passend zur Saison - Herbstlaub, Weihnachtsdeko, Frühlingsblumen oder Sommervibes.
Style: Stimmungsvolle, warme Fotografie mit saisonaler Farbpalette, Bokeh-Effekte.
Markenbezug: Produkt bleibt Hauptfokus, saisonale Elemente ergänzen die Markenwerte.
Text im Bild: Optional saisonaler Gruß oder Angebot.`,
    style: 'realistic',
    aspectRatio: '1:1',
    tags: ['seasonal', 'mood', 'holiday', 'atmosphere', 'festive'],
  },
  {
    id: 'customer-testimonial',
    name: 'Kunden-Testimonial',
    description: 'Zitat mit Kundenfoto-Platzhalter für Social Proof',
    category: 'brand',
    promptTemplate: `Subject: Stilisierter Testimonial-Frame mit Platzhalter für Kundenfoto.
Composition: Kundenbereich (Foto/Avatar) links oder oben, Zitat-Bereich rechts oder unten.
Action: Statisch, text-fokussiert.
Location: Dezenter, eleganter Hintergrund in Markenfarben mit subtilen Mustern.
Style: Modern, clean, vertrauensbildend, professionelles Social-Proof-Design.
Markenbezug: Markenfarben, Logo dezent platziert, konsistente Typografie.
Text im Bild: "[ZITAT]" - [KUNDENNAME] ⭐⭐⭐⭐⭐ Sternebewertung optional.`,
    style: 'minimal',
    aspectRatio: '1:1',
    tags: ['testimonial', 'review', 'social-proof', 'customer', 'quote'],
  },
  {
    id: 'announcement-banner',
    name: 'Ankündigungs-Banner',
    description: 'Aufmerksamkeitsstarkes Banner für Sales, Launches oder News',
    category: 'brand',
    promptTemplate: `Subject: Bold typografisches Design mit starker Hauptbotschaft.
Composition: Zentriert oder asymmetrisch, klare visuelle Hierarchie, Headline dominant.
Action: Statisch, aber dynamisch wirkend durch Typografie und Farben.
Location: Abstrakter Hintergrund mit Farbverlauf oder geometrischen Formen in Markenfarben.
Style: Modern, bold, eye-catching, hoher Kontrast, klare Lesbarkeit.
Markenbezug: Primäre Markenfarben, Logo sichtbar, Brand-Fonts.
Text im Bild: "[HAUPTBOTSCHAFT]" groß, "[DETAILS/DATUM]" kleiner darunter, CTA-Button-Optik.`,
    style: 'modern',
    aspectRatio: '1:1',
    tags: ['announcement', 'sale', 'launch', 'news', 'banner', 'bold'],
  },
  {
    id: 'gift-wrapping',
    name: 'Geschenkverpackung',
    description: 'Produkt als liebevoll verpacktes Geschenk präsentiert',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] schön verpackt als Geschenk mit Schleife und Dekoration.
Composition: Geschenk im Zentrum, leicht schräger Winkel, umgeben von Verpackungsmaterial.
Action: Halb ausgepackt oder perfekt verpackt, einladend präsentiert.
Location: Festlicher, einladender Hintergrund - Tisch mit Konfetti, Blumen oder saisonaler Deko.
Style: Warm, einladend, festlich, hochwertige Produktfotografie mit Lifestyle-Touch.
Markenbezug: Verpackung in Markenfarben, Geschenkband passend, Logo auf Tag oder Karte.
Text im Bild: Optional "Das perfekte Geschenk" oder ähnlich.`,
    style: 'realistic',
    aspectRatio: '4:5',
    tags: ['gift', 'wrapping', 'present', 'celebration', 'festive'],
  },
]

// ================== VIDEO PRESETS ==================

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'product-teaser-reel',
    name: 'Produkt-Teaser Reel',
    description: '4-6 Sekunden, Close-ups, schnelle Cuts, CTA-Overlay',
    category: 'teaser',
    promptTemplate: `Cinematography: Schnelle Sequenz aus 3-4 schnellen Schnitten, beginnend mit einem Close-up des Produkts, dann ein kurzer Kameraschwenk und ein finaler hero shot.
Subject: Ein [PRODUKTNAME] im Vordergrund.
Action: Leichte Drehung des Produkts oder Zoom-in, um Details wie Textur oder Personalisierung zu zeigen.
Context: Sauberer Hintergrund in Markenfarben mit leichtem Bokeh; eventuell ein kurzer Shot, wo das Produkt in einer Hand gehalten wird.
Style & Ambiance: Moderner, hochwertiger Look, helle, freundliche Stimmung, leichte Glanzlichter auf dem Produkt, keine Unordnung.
Audio: Treibende, moderne Hintergrundmusik ohne Text, Tempo passend zur Schnittgeschwindigkeit.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['reel', 'product', 'teaser', 'dynamic'],
  },
  {
    id: 'before-after-reel',
    name: 'Before/After Reel',
    description: 'Split-Screen oder Sequenz für Transformationen',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Side-by-side Split-Screen oder nacheinander; zuerst "Before", dann "After", mit einem sanften Übergang oder einem schnellen Wipe-Effekt.
Subject: Dasselbe Produkt oder derselbe Raum in zwei Zuständen (vorher / nachher).
Action: Langsame Kamerafahrt von links nach rechts oder ein leichtes Zoom-in bei beiden Szenen.
Context: Konsistente Umgebung, damit der Unterschied zwischen Before und After klar sichtbar ist.
Style & Ambiance: Deutlich sichtbarer Qualitätsunterschied: Before eher neutral/unscheinbar, After hell, aufgeräumt, professionell.
Audio: Ruhige Musik, ein kleiner "Whoosh"-Sound beim Übergang von Before zu After.`,
    duration: 6,
    format: '9:16',
    audioType: 'music',
    tags: ['reel', 'before-after', 'transformation', 'comparison'],
  },
  {
    id: 'story-teaser',
    name: 'Story-Teaser',
    description: 'Großer Text, emotionaler Shot für Stories',
    category: 'story',
    promptTemplate: `Cinematography: Langsamer Zoom oder subtile Kamerabewegung, fokussiert auf emotionalen Moment.
Subject: Hauptperson oder Produkt in emotionaler Situation.
Action: Subtile, ruhige Bewegung - ein Lächeln, eine sanfte Geste.
Context: Warme, einladende Umgebung mit weichem Licht.
Style & Ambiance: Emotional, warm, einladend, cinematischer Look mit shallow depth of field.
Audio: Sanfte, emotionale Hintergrundmusik, keine Dialoge.
Text Overlay: Große, gut lesbare Typografie mit emotionaler Botschaft.`,
    duration: 4,
    format: '9:16',
    audioType: 'music',
    tags: ['story', 'emotional', 'teaser', 'branding'],
  },
  {
    id: 'product-showcase',
    name: 'Produkt-Showcase',
    description: '360° Produktpräsentation mit Details',
    category: 'brand',
    promptTemplate: `Cinematography: Smooth 360-degree rotation around the product, with occasional close-up cuts to show details.
Subject: [PRODUKTNAME] auf einem Präsentationstisch oder schwebendem Display.
Action: Kontinuierliche, langsame Drehung mit Detailaufnahmen.
Context: Sauberes Studio-Setting mit professioneller Beleuchtung.
Style & Ambiance: Premium, professionell, produktfokussiert, elegantes Lighting.
Audio: Elegante, dezente Hintergrundmusik.`,
    duration: 8,
    format: '1:1',
    audioType: 'music',
    tags: ['product', 'showcase', '360', 'premium'],
  },
  {
    id: 'unboxing-teaser',
    name: 'Unboxing-Teaser',
    description: 'Kurzes Unboxing-Video für Spannung',
    category: 'teaser',
    promptTemplate: `Cinematography: Close-up auf Hände, die eine Verpackung öffnen, dann reveal shot des Produkts.
Subject: Hands opening a branded package to reveal [PRODUKTNAME].
Action: Langsames, bewusstes Auspacken mit Fokus auf der Spannung des Reveals.
Context: Sauberer Tisch oder Oberfläche, neutraler Hintergrund.
Style & Ambiance: ASMR-like quality, satisfying movements, premium feel.
Audio: Leise ASMR-artige Geräusche (Papier, Verpackung), sanfte Hintergrundmusik.`,
    duration: 6,
    format: '9:16',
    audioType: 'ambient',
    tags: ['unboxing', 'reveal', 'teaser', 'satisfying'],
  },
  // ========== NEW VIDEO PRESETS ==========
  {
    id: 'customer-review-reel',
    name: 'Kunden-Review Reel',
    description: 'Animierte Kundenbewertung als kurzes Reel',
    category: 'brand',
    promptTemplate: `Cinematography: Statische oder leichte Zoom-Bewegung, Text-Animationen im Fokus.
Subject: Stilisierter Review-Screen mit Sternebewertung und Kundenzitat.
Action: Text erscheint animiert, Sterne leuchten auf, Produkt-Shot am Ende.
Context: Eleganter Hintergrund in Markenfarben, dezente Partikel oder Lichteffekte.
Style & Ambiance: Modern, vertrauensbildend, professionell, cleane Typografie.
Audio: Upbeat aber subtile Hintergrundmusik, optional Whoosh-Sounds bei Text-Animationen.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['review', 'testimonial', 'social-proof', 'animated', 'trust'],
  },
  {
    id: 'how-to-tutorial',
    name: 'How-To Tutorial',
    description: 'Schnelles Tutorial mit Schritt-für-Schritt Anleitung',
    category: 'tutorial',
    promptTemplate: `Cinematography: Top-down oder leicht schräge Perspektive, klare Schnitte zwischen Schritten.
Subject: Hände demonstrieren die Verwendung/Pflege von [PRODUKTNAME].
Action: Klare, nachvollziehbare Schritte: Schritt 1, 2, 3 mit Fokus auf die Handlung.
Context: Aufgeräumter Arbeitsbereich, alle benötigten Materialien sichtbar.
Style & Ambiance: Informativ, freundlich, leicht zu folgen, gute Beleuchtung.
Audio: Klare Hintergrundmusik, optional Text-Overlays mit Schritt-Nummern.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['tutorial', 'how-to', 'educational', 'step-by-step', 'diy'],
  },
  {
    id: 'mood-aesthetic',
    name: 'Mood Aesthetic',
    description: 'Atmosphärisches Stimmungsvideo für Brand Awareness',
    category: 'brand',
    promptTemplate: `Cinematography: Langsame, cinematische Kamerabewegungen, sanfte Übergänge, Slow-Motion-Elemente.
Subject: [PRODUKTNAME] in verschiedenen stimmungsvollen Szenen.
Action: Subtile Bewegungen - Lichtspiel, sanfter Wind, fließende Stoffe, Reflexionen.
Context: Ästhetische, zur Marke passende Umgebung mit viel Atmosphäre.
Style & Ambiance: Dreamy, aspirational, warm oder kühl je nach Markenidentität, cinematischer Look.
Audio: Emotionale, atmosphärische Musik ohne Lyrics, Ambiente-Sounds.`,
    duration: 6,
    format: '9:16',
    audioType: 'ambient',
    tags: ['aesthetic', 'mood', 'cinematic', 'brand', 'atmospheric'],
  },
  {
    id: 'countdown-sale',
    name: 'Countdown Sale',
    description: 'Dynamisches Sale-Ankündigungsvideo mit Countdown-Element',
    category: 'teaser',
    promptTemplate: `Cinematography: Schnelle Schnitte, dynamische Zooms, pulsierende Bewegungen zum Beat.
Subject: Produkte im Sale-Spotlight, Countdown-Zahlen, Rabatt-Prozente.
Action: Countdown-Animation (3, 2, 1, SALE!), Produkte flashen auf, CTA am Ende.
Context: Bold, energetischer Hintergrund mit Markenfarben, Konfetti oder Partikel-Effekte.
Style & Ambiance: Urgent, exciting, bold, hoher Kontrast, energiegeladen.
Audio: Uptempo Beat, Countdown-Sounds, energetische Drops.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['sale', 'countdown', 'urgent', 'discount', 'promotion', 'dynamic'],
  },
  {
    id: 'day-in-life',
    name: 'Day in the Life',
    description: 'Mini-Vlog Stil - Produkt im Alltag integriert',
    category: 'story',
    promptTemplate: `Cinematography: POV und Third-Person Mix, natürliche Handheld-Bewegungen, authentische Übergänge.
Subject: Person im Alltag, die [PRODUKTNAME] natürlich verwendet.
Action: Morgenroutine, Arbeit, Pause, Feierabend - Produkt als natürlicher Teil des Tages.
Context: Realistische Alltagsumgebung - Zuhause, Büro, Café, unterwegs.
Style & Ambiance: Authentic, relatable, warm, natürliches Licht, Social-Media-native Look.
Audio: Trendy Hintergrundmusik, optional ASMR-Sounds bei Produktnutzung.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['vlog', 'day-in-life', 'authentic', 'lifestyle', 'relatable'],
  },
]

// Helper functions
export function getImagePresetById(id: string): ImagePreset | undefined {
  return IMAGE_PRESETS.find(preset => preset.id === id)
}

export function getVideoPresetById(id: string): VideoPreset | undefined {
  return VIDEO_PRESETS.find(preset => preset.id === id)
}

export function getImagePresetsByCategory(category: ImagePreset['category']): ImagePreset[] {
  return IMAGE_PRESETS.filter(preset => preset.category === category)
}

export function getVideoPresetsByCategory(category: VideoPreset['category']): VideoPreset[] {
  return VIDEO_PRESETS.filter(preset => preset.category === category)
}

export function applyProductNameToTemplate(template: string, productName: string): string {
  return template.replace(/\[PRODUKTNAME\]/g, productName)
}

export function applyQuoteToTemplate(template: string, quote: string, author?: string): string {
  let result = template.replace(/\[ZITAT\]/g, quote)
  if (author) {
    result = result.replace(/\[AUTOR\]/g, author)
  }
  return result
}

// AI Presets for Image and Video Generation
// Based on Nano Banana Pro and Veo 3.1 Guidelines
// Prompting Guide: https://blog.google/products/gemini/prompting-tips-nano-banana-pro/

export interface ImagePreset {
  id: string
  name: string
  description: string
  category: 'product' | 'lifestyle' | 'story' | 'carousel' | 'brand' | 'portrait' | 'enhancement'
  promptTemplate: string
  style: string
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '2:3'
  tags: string[]
  requiresImage?: boolean // For image editing/enhancement presets
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
  
  // ========== NEUE PRODUKT-PRESETS (Basierend auf Google Nano Banana Pro Guideline) ==========
  
  {
    id: 'hero-product-shot',
    name: 'Hero Product Shot',
    description: 'Premium Hauptproduktbild für Website/Shop - maximale Qualität',
    category: 'product',
    promptTemplate: `Subject: Ein einzelnes [PRODUKTNAME] als Hero-Shot, absolut perfekt präsentiert.
Composition: Zentrierte, frontale Aufnahme mit leichtem Winkel, Produkt füllt 60-70% des Frames.
Action: Statisch, das Produkt steht oder schwebt leicht erhöht.
Location: Premium Studio-Setting mit nahtlosem, neutralen Hintergrund mit sanftem Gradient.
Style: Ultra-hochauflösende kommerzielle Produktfotografie, drei-Punkt-Beleuchtung, perfekte Reflexionen, f/8 Schärfentiefe für maximale Details.
Camera: Medium shot, 85mm Objektiv-Look, leichte Perspektive von vorne-oben.
Lighting: Professionelles Studiolicht mit Softboxen, dezente Rim-Lights für Konturierung.
Markenbezug: Farben und Material des Produkts im Fokus, keine Ablenkung.`,
    style: 'premium',
    aspectRatio: '1:1',
    tags: ['hero', 'product', 'premium', 'ecommerce', 'shop', 'professional'],
  },
  {
    id: 'product-detail-macro',
    name: 'Produkt-Detail Makro',
    description: 'Extreme Nahaufnahme für Texturen, Nähte, Details',
    category: 'product',
    promptTemplate: `Subject: Extreme Nahaufnahme eines Details von [PRODUKTNAME] - zeige Qualität und Handwerkskunst.
Composition: Extreme close-up / Makro-Shot, Detail füllt den ganzen Frame, shallow depth of field.
Action: Statisch, fokussiert auf Textur, Naht, Material oder besonderes Detail.
Location: Neutral, das Detail steht im absoluten Fokus.
Style: Makro-Produktfotografie, f/2.8 für selektive Schärfe, sichtbare Materialstruktur.
Camera: Makro-Objektiv-Look, sehr nah, Bokeh im Hintergrund.
Lighting: Weiches Seitenlicht um Texturen hervorzuheben, keine harten Schatten.
Markenbezug: Zeige die Qualität und Liebe zum Detail, die in das Produkt gesteckt wurde.`,
    style: 'macro',
    aspectRatio: '1:1',
    tags: ['detail', 'macro', 'texture', 'quality', 'craftsmanship', 'close-up'],
  },
  {
    id: 'product-in-use',
    name: 'Produkt in Benutzung',
    description: 'Zeigt das Produkt während der aktiven Nutzung',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] wird aktiv von einer Person benutzt - zeige den praktischen Nutzen.
Composition: Medium shot, Person und Produkt beide sichtbar, natürlicher Blickwinkel.
Action: Aktive, natürliche Nutzung des Produkts - greifen, halten, verwenden, interagieren.
Location: Passende Alltagsumgebung zur Zielgruppe - Zuhause, Büro, Unterwegs, je nach Produkt.
Style: Lifestyle-Fotografie mit dokumentarischem Touch, authentisch, nicht gestellt wirkend.
Camera: 35-50mm Look, natürliche Perspektive, leichte Bewegungsunschärfe erlaubt.
Lighting: Natürliches Tageslicht oder warme Innenbeleuchtung, keine Studio-Perfektion.
Markenbezug: Das Produkt löst ein Problem oder bereichert den Alltag der Person.`,
    style: 'lifestyle',
    aspectRatio: '4:5',
    tags: ['in-use', 'action', 'lifestyle', 'practical', 'authentic', 'user'],
  },
  {
    id: 'product-collection',
    name: 'Produkt-Kollektion',
    description: 'Mehrere Produkte/Varianten elegant arrangiert',
    category: 'product',
    promptTemplate: `Subject: Eine Kollektion von [PRODUKTNAME] in verschiedenen Farben oder Varianten, kunstvoll arrangiert.
Composition: Gruppenbild mit klarer Hierarchie, Hauptprodukt zentral, Varianten drumherum angeordnet.
Action: Statisch, perfekt arrangiert, jedes Produkt sichtbar.
Location: Premium Studio mit nahtlosem Hintergrund oder eleganter Oberfläche (Marmor, Holz).
Style: High-end Katalog-Fotografie, perfekte Abstände, harmonische Farbbalance.
Camera: Leicht erhöhter Winkel (15-20°), genug Abstand um alles zu zeigen, f/11 für Schärfe überall.
Lighting: Even lighting across all products, soft shadows, professional product lighting.
Markenbezug: Zeige die Vielfalt und Konsistenz der Marke, einheitlicher Look über alle Produkte.`,
    style: 'collection',
    aspectRatio: '16:9',
    tags: ['collection', 'variants', 'colors', 'group', 'catalog', 'range'],
  },
  {
    id: 'product-scale-context',
    name: 'Produkt mit Größenvergleich',
    description: 'Zeigt die tatsächliche Größe des Produkts im Kontext',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] neben bekannten Objekten für Größenkontext - Hand, Tasse, Stift, Münze.
Composition: Produkt im Zentrum mit Referenzobjekten, die die Größe verdeutlichen.
Action: Statisch, vergleichend.
Location: Sauberer, neutraler Hintergrund oder einfacher Tisch.
Style: Informativer Produktfoto-Stil, klar und verständlich, gute Beleuchtung.
Camera: Straight-on oder leicht erhöht, alles scharf im Fokus.
Lighting: Helles, gleichmäßiges Licht ohne ablenkende Schatten.
Markenbezug: Ehrliche Darstellung, der Kunde soll wissen was er bekommt.`,
    style: 'informative',
    aspectRatio: '1:1',
    tags: ['scale', 'size', 'comparison', 'context', 'informative', 'honest'],
  },
  {
    id: 'product-packaging',
    name: 'Produkt mit Verpackung',
    description: 'Zeigt Produkt und Originalverpackung zusammen',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] elegant neben oder vor seiner Verpackung präsentiert.
Composition: Produkt leicht im Vordergrund, Verpackung dahinter oder daneben, beide gut sichtbar.
Action: Statisch, wie frisch ausgepackt oder zum Verschenken bereit.
Location: Premium Oberfläche - Holz, Marmor oder sauberer Gradient-Hintergrund.
Style: Unboxing-Ready Look, premium, einladend, professionelle Produktfotografie.
Camera: Medium shot, leichter Winkel, f/5.6 für Tiefenschärfe.
Lighting: Hauptlicht auf dem Produkt, Verpackung gut ausgeleuchtet aber nicht dominant.
Markenbezug: Verpackungsdesign und Produkt ergänzen sich, Brand-Konsistenz sichtbar.`,
    style: 'premium',
    aspectRatio: '4:5',
    tags: ['packaging', 'box', 'unboxing', 'premium', 'gift-ready', 'presentation'],
  },
  {
    id: 'floating-product',
    name: 'Schwebendes Produkt',
    description: 'Dynamischer Look mit schwebendem Produkt und Schatten',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] schwebt elegant in der Luft mit realistischem Schatten darunter.
Composition: Produkt zentriert, schwebt ca. 20cm über einer Oberfläche, perfekter Schatten darunter.
Action: Schwebend, leichte Dynamik, als würde es gerade aufsteigen oder sanft fallen.
Location: Sauberer, heller Hintergrund mit subtiler Oberfläche für den Schatten.
Style: Moderner E-Commerce Style, clean, dynamisch, eye-catching.
Camera: Frontal oder leicht von unten für dramatischen Effekt.
Lighting: Drei-Punkt-Beleuchtung, Hauptlicht von oben, Schatten weich aber definiert.
Markenbezug: Moderner, innovativer Look passend zu einer zeitgemäßen Marke.`,
    style: 'dynamic',
    aspectRatio: '1:1',
    tags: ['floating', 'levitation', 'dynamic', 'modern', 'creative', 'shadow'],
  },
  {
    id: 'product-360-angle',
    name: 'Produkt 3/4 Ansicht',
    description: 'Klassische 3/4 Ansicht zeigt Vorder- und Seitenansicht',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] in klassischer 3/4 Ansicht - zeigt sowohl Front als auch Seite.
Composition: Produkt im 45° Winkel gedreht, Front und eine Seite sichtbar.
Action: Statisch, klassische Produktpose.
Location: Nahtloser Hintergrund in neutraler Farbe oder passend zur Marke.
Style: Klassische kommerzielle Produktfotografie, zeitlos, professionell.
Camera: Medium shot, 70-85mm Look, f/8 für durchgängige Schärfe.
Lighting: Klassisches Drei-Punkt-Licht, Hauptlicht 45° von vorne-rechts, Fill-Light links, Rim-Light von hinten.
Markenbezug: Zeige das Produkt von seiner besten Seite, alle wichtigen Details sichtbar.`,
    style: 'classic',
    aspectRatio: '1:1',
    tags: ['angle', '3/4-view', 'classic', 'professional', 'commercial', 'multi-angle'],
  },
  {
    id: 'product-lifestyle-table',
    name: 'Lifestyle Tisch-Szene',
    description: 'Produkt auf einem stilvollen Tisch mit passenden Accessoires',
    category: 'lifestyle',
    promptTemplate: `Subject: [PRODUKTNAME] als Teil einer kurierten Tisch-Szene mit passenden Lifestyle-Accessoires.
Composition: Produkt als Hauptelement, umgeben von thematisch passenden Objekten (Pflanzen, Bücher, Kaffee, etc.).
Action: Statisch, arrangiert aber natürlich wirkend, als würde jemand gleich zugreifen.
Location: Stilvoller Tisch oder Arbeitsfläche in einer einladenden Umgebung.
Style: Instagram-worthy Lifestyle-Flatlay oder erhöhte Tischperspektive, warm und einladend.
Camera: Leicht erhöhter Winkel oder Vogelperspektive, 35mm Look.
Lighting: Warmes, natürliches Tageslicht von der Seite, sanfte Schatten.
Markenbezug: Accessoires passen zur Zielgruppe und verstärken die Markenbotschaft.`,
    style: 'lifestyle',
    aspectRatio: '1:1',
    tags: ['lifestyle', 'table', 'accessories', 'styled', 'curated', 'instagram'],
  },
  {
    id: 'seasonal-product-spring',
    name: 'Frühlings-Produktszene',
    description: 'Produkt in frischer Frühlingsatmosphäre',
    category: 'brand',
    promptTemplate: `Subject: [PRODUKTNAME] umgeben von frischen Frühlingsblumen und hellem, frischem Ambiente.
Composition: Produkt im Vordergrund, Frühlingsblumen (Tulpen, Narzissen, Kirschblüten) als Rahmen.
Action: Statisch, frisch und einladend.
Location: Heller, luftiger Hintergrund mit natürlichem Licht und Frühlingsdekor.
Style: Frische, lebendige Frühlingsfarben, Pastelle und Weiß dominant, optimistische Stimmung.
Camera: Medium shot, helle, überbelichtete Ästhetik (high-key).
Lighting: Helles, weiches Tageslicht, Frühlingssonne-Effekt.
Markenbezug: Saisonale Frische, Neuanfang, perfekt für Frühjahrs-Kampagnen.`,
    style: 'seasonal',
    aspectRatio: '1:1',
    tags: ['spring', 'seasonal', 'flowers', 'fresh', 'bright', 'pastel'],
  },
  
  // ========== PORTRAIT / PERSONENBILD PRESETS ==========
  
  {
    id: 'portrait-enhancement',
    name: 'Portrait Verbesserung',
    description: 'Verbessere Beleuchtung, Hauttöne und Hintergrund eines Portraits',
    category: 'portrait',
    requiresImage: true,
    promptTemplate: `Editing Instructions: Verbessere dieses Portrait-Foto mit folgenden Anpassungen:
- Optimiere die Hautbeleuchtung für einen natürlichen, schmeichelhaften Look
- Balanciere Hauttöne für ein gesundes, warmes Erscheinungsbild
- Verstärke Augendetails für mehr Ausdruckskraft
- Sanfte Glättung bei Beibehaltung natürlicher Textur
- Leichte Aufhellung unter den Augen
- Verbessere den Hintergrund für einen professionelleren Look
Style: Professionelle Portrait-Retusche, natürlich, nicht übertrieben.
Erhalte: Natürliche Gesichtszüge, Charakter und Persönlichkeit der Person.`,
    style: 'enhancement',
    aspectRatio: '4:5',
    tags: ['portrait', 'enhancement', 'retouch', 'skin', 'lighting', 'professional'],
  },
  {
    id: 'portrait-background-change',
    name: 'Portrait Hintergrund ändern',
    description: 'Ersetze den Hintergrund durch professionellen Studio-Look',
    category: 'portrait',
    requiresImage: true,
    promptTemplate: `Editing Instructions: Ersetze den Hintergrund dieses Portraits durch einen professionellen Studio-Hintergrund:
- Nahtloser Gradient-Hintergrund in neutralem Grau oder warmem Beige
- Sanfter Vignetten-Effekt Richtung Ränder
- Perfekte Kantentrennung zwischen Person und Hintergrund
- Haare natürlich freigestellt, keine harten Kanten
- Schatten der Person auf neuem Hintergrund realistisch
Style: Professionelles Studio-Portrait, clean und zeitlos.
Erhalte: Alle Details der Person, natürliche Beleuchtung auf der Person.`,
    style: 'studio',
    aspectRatio: '4:5',
    tags: ['portrait', 'background', 'studio', 'professional', 'clean', 'gradient'],
  },
  {
    id: 'portrait-headshot-business',
    name: 'Business Headshot',
    description: 'Transformiere ein Foto in ein professionelles Business-Portrait',
    category: 'portrait',
    requiresImage: true,
    promptTemplate: `Editing Instructions: Transformiere dieses Foto in ein professionelles Business-Headshot:
- Professioneller, neutraler Hintergrund (Grau oder Navy-Gradient)
- Business-appropriate Beleuchtung mit professionellen Catchlights in den Augen
- Subtile Hautverbesserung für sauberen, professionellen Look
- Schärfe auf Augen und Gesicht optimiert
- Kleidung und Haltung professionell erscheinen lassen
- LinkedIn/Corporate Website-ready Qualität
Style: Corporate Headshot, vertrauenserweckend, kompetent, approachable.
Erhalte: Authentischer Gesichtsausdruck, natürliche Züge.`,
    style: 'business',
    aspectRatio: '1:1',
    tags: ['headshot', 'business', 'corporate', 'linkedin', 'professional', 'portrait'],
  },
  {
    id: 'portrait-artistic-style',
    name: 'Künstlerisches Portrait',
    description: 'Verwandle ein Foto in ein stilisiertes, künstlerisches Portrait',
    category: 'portrait',
    requiresImage: true,
    promptTemplate: `Editing Instructions: Transformiere dieses Portrait in ein künstlerisches, stilisiertes Bild:
- Wähle einen einzigartigen künstlerischen Stil (inspiriert von klassischer Malerei oder modernen Illustration)
- Behalte die erkennbare Ähnlichkeit der Person
- Verstärke dramatische Beleuchtung und Kontraste
- Füge künstlerische Textur oder Pinselstrich-Effekte hinzu
- Harmonische, ausdrucksstarke Farbpalette
Style: Künstlerisches Portrait, expressiv, einzigartig, gallery-worthy.
Erhalte: Erkennbarkeit der Person, Charakter und Ausdruck.`,
    style: 'artistic',
    aspectRatio: '4:5',
    tags: ['portrait', 'artistic', 'stylized', 'creative', 'painting', 'unique'],
  },
  {
    id: 'portrait-lighting-fix',
    name: 'Portrait Beleuchtung korrigieren',
    description: 'Korrigiere schlechte Beleuchtung in einem Portrait',
    category: 'portrait',
    requiresImage: true,
    promptTemplate: `Editing Instructions: Korrigiere die Beleuchtung in diesem Portrait:
- Entferne harte Schatten unter Augen und Nase
- Gleiche überbelichtete oder unterbelichtete Bereiche aus
- Füge sanftes Fill-Light hinzu wo nötig
- Erstelle schmeichelhafte Catchlights in den Augen
- Balanciere Gesichtsbeleuchtung für natürlichen, gleichmäßigen Look
- Erhalte Tiefe und Dimension ohne flach zu wirken
Style: Natürliche, schmeichelhafte Porträtbeleuchtung wie von einem Profi fotografiert.
Erhalte: Alle natürlichen Details und Texturen.`,
    style: 'correction',
    aspectRatio: '4:5',
    tags: ['portrait', 'lighting', 'fix', 'correction', 'shadows', 'enhancement'],
  },
  
  // ========== WEITERE PRODUKTFOTO-PRESETS ==========
  
  {
    id: 'product-instagram-ready',
    name: 'Instagram-Ready Produkt',
    description: 'Optimiert für Instagram Feed mit perfektem Cropping und Filter',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] perfekt für Instagram optimiert mit trendiger Ästhetik.
Composition: Instagram-optimiertes 1:1 oder 4:5 Format, Produkt perfekt im Frame, negative space für Text-Overlays.
Action: Statisch oder mit subtiler Dynamik (Schatten, Reflexionen).
Location: Trendy, Instagram-worthy Hintergrund - Terrazzo, bunter Gradient, oder minimalistisch clean.
Style: Social-Media-Native Look, leicht entsättigte Farben oder warme Töne, modern und ansprechend.
Camera: Smartphone-Ästhetik oder polierter Instagram-Influencer-Style.
Lighting: Natürliches Licht-Look, soft und schmeichelhaft.
Markenbezug: Perfekt shareable, löst Engagement aus, passt zur Instagram-Ästhetik der Marke.`,
    style: 'instagram',
    aspectRatio: '1:1',
    tags: ['instagram', 'social-media', 'trendy', 'feed', 'engagement', 'shareable'],
  },
  {
    id: 'product-white-background',
    name: 'Produkt auf Weiß',
    description: 'Klassisches E-Commerce Foto auf reinweißem Hintergrund',
    category: 'product',
    promptTemplate: `Subject: [PRODUKTNAME] freigestellt auf absolut reinem Weiß (#FFFFFF Hintergrund).
Composition: Produkt zentriert, genug Rand rundherum, perfekt für E-Commerce Listings.
Action: Statisch, frontal oder leichte 3/4 Ansicht.
Location: Nahtloser, reinweißer Hintergrund ohne jegliche Textur oder Schatten.
Style: Amazon/eBay/Shop-ready, clean, professionell, hohe Auflösung.
Camera: Produktfotografie-Standard, gleichmäßige Schärfe, keine Verzerrung.
Lighting: Helles, schattenfreies Licht, Produkt vollständig ausgeleuchtet.
Markenbezug: Neutraler Standard, lässt das Produkt für sich sprechen.`,
    style: 'ecommerce',
    aspectRatio: '1:1',
    tags: ['white-background', 'ecommerce', 'amazon', 'shop', 'listing', 'clean'],
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

// ================== PROMPT ENHANCEMENT SYSTEM ==================
// Based on Google's Nano Banana Pro Prompting Guide
// https://blog.google/products/gemini/prompting-tips-nano-banana-pro/

/**
 * Structure for an optimized image prompt based on Google's guidelines
 */
export interface OptimizedPromptStructure {
  subject: string          // Who or what is in the image
  composition: string      // How is the shot framed
  action: string           // What is happening
  location: string         // Where does the scene take place
  style: string            // What is the overall aesthetic
  camera?: string          // Camera settings and angle
  lighting?: string        // Lighting details
  editingInstructions?: string  // For modifying existing images
}

/**
 * Prompt enhancement guidelines based on Google's official Nano Banana Pro guide
 */
export const PROMPT_ENHANCEMENT_GUIDE = {
  // Core Elements (Always include)
  coreElements: [
    'Subject: Who or what is in the image - be specific',
    'Composition: How the shot is framed (close-up, wide shot, portrait, etc.)',
    'Action: What is happening in the scene',
    'Location: Where does the scene take place',
    'Style: Overall aesthetic (photorealistic, watercolor, cinematic, etc.)',
  ],
  
  // Advanced refinements for professional results
  advancedElements: [
    'Aspect Ratio: Define the canvas (9:16 vertical, 16:9 widescreen, 1:1 square)',
    'Camera Details: Angle, depth of field, lens type (f/1.8, 85mm, etc.)',
    'Lighting: Golden hour, studio lighting, soft shadows, rim light',
    'Text Integration: Specify fonts, placement, and styling for any text',
    'Reference Role: When using images, define each image\'s role clearly',
  ],
  
  // Style keywords that improve results
  styleKeywords: {
    photography: ['photorealistic', 'professional photography', 'studio lighting', 'high resolution', 'sharp focus'],
    product: ['product photography', 'commercial', 'catalog style', 'e-commerce ready', 'clean background'],
    lifestyle: ['authentic', 'natural light', 'candid moment', 'warm tones', 'lifestyle photography'],
    artistic: ['digital art', 'illustration', 'painterly', 'stylized', 'creative'],
    cinematic: ['cinematic', 'film grain', 'anamorphic', 'dramatic lighting', 'movie still'],
    minimal: ['minimalist', 'clean', 'negative space', 'simple', 'modern'],
  },
  
  // Common improvements for weak prompts
  improvements: {
    addSpecificity: 'Add specific details about the subject, environment, and style',
    addComposition: 'Define the framing: close-up, medium shot, wide shot, overhead',
    addLighting: 'Specify lighting: soft, dramatic, golden hour, studio',
    addMood: 'Include emotional/atmospheric descriptors',
    addTechnical: 'Add camera/technical details for professional look',
  },
}

/**
 * Enhance a user's basic prompt to follow Google's Nano Banana Pro guidelines
 * This function structures the prompt for optimal AI image generation results
 */
export function enhancePromptForAI(
  userPrompt: string,
  options?: {
    productName?: string
    style?: 'photography' | 'product' | 'lifestyle' | 'artistic' | 'cinematic' | 'minimal'
    aspectRatio?: string
    includeRefImage?: boolean
    brandContext?: string
  }
): string {
  // If prompt is already well-structured (contains key markers), return with minimal changes
  const structuredMarkers = ['Subject:', 'Composition:', 'Style:', 'Location:', 'Action:']
  const isAlreadyStructured = structuredMarkers.some(marker => 
    userPrompt.toLowerCase().includes(marker.toLowerCase())
  )
  
  if (isAlreadyStructured) {
    // Just add brand context if provided
    if (options?.brandContext) {
      return `Brand Context:\n${options.brandContext}\n\n${userPrompt}`
    }
    return userPrompt
  }
  
  // Build enhanced prompt structure
  const styleKeywords = options?.style 
    ? PROMPT_ENHANCEMENT_GUIDE.styleKeywords[options.style] 
    : PROMPT_ENHANCEMENT_GUIDE.styleKeywords.photography
  
  const enhancedParts: string[] = []
  
  // Add brand context first if provided
  if (options?.brandContext) {
    enhancedParts.push(`Brand Context:\n${options.brandContext}`)
  }
  
  // Subject
  if (options?.productName) {
    enhancedParts.push(`Subject: ${options.productName} - ${userPrompt}`)
  } else {
    enhancedParts.push(`Subject: ${userPrompt}`)
  }
  
  // Add style enhancement
  enhancedParts.push(`Style: ${styleKeywords.join(', ')}`)
  
  // Add technical defaults for professional results
  enhancedParts.push('Quality: High resolution, sharp details, professional quality')
  
  // Add aspect ratio context if specified
  if (options?.aspectRatio) {
    const ratioDescriptions: Record<string, string> = {
      '1:1': 'Square format, centered composition',
      '4:5': 'Portrait format, ideal for Instagram feed',
      '9:16': 'Vertical format, perfect for Stories and Reels',
      '16:9': 'Widescreen format, cinematic composition',
      '3:4': 'Classic portrait format',
      '2:3': 'Traditional portrait format',
    }
    enhancedParts.push(`Composition: ${ratioDescriptions[options.aspectRatio] || 'Balanced composition'}`)
  }
  
  // Add reference image instructions if applicable
  if (options?.includeRefImage) {
    enhancedParts.push('Reference: Use the provided reference image as the base, maintaining its key elements while applying the requested changes')
  }
  
  return enhancedParts.join('\n')
}

/**
 * Generate improvement suggestions for a user's prompt
 */
export function getPromptImprovementSuggestions(userPrompt: string): string[] {
  const suggestions: string[] = []
  const promptLower = userPrompt.toLowerCase()
  
  // Check for missing core elements
  if (!promptLower.includes('subject') && promptLower.length < 50) {
    suggestions.push('📝 Beschreibe das Hauptmotiv genauer (Was genau soll im Bild sein?)')
  }
  
  if (!/(close-up|wide shot|portrait|overhead|macro|medium shot)/i.test(promptLower)) {
    suggestions.push('📐 Füge Kompositionsdetails hinzu (Nahaufnahme, Weitwinkel, Portrait...)')
  }
  
  if (!/(light|lighting|shadow|bright|dark|golden hour|studio)/i.test(promptLower)) {
    suggestions.push('💡 Beschreibe die Beleuchtung (Weiches Licht, Studioblitz, Tageslicht...)')
  }
  
  if (!/(style|aesthetic|realistic|artistic|cinematic|minimal)/i.test(promptLower)) {
    suggestions.push('🎨 Definiere den Stil (Fotorealistisch, Künstlerisch, Minimalistisch...)')
  }
  
  if (!/(background|location|setting|environment|scene)/i.test(promptLower)) {
    suggestions.push('🏠 Beschreibe den Hintergrund/Ort (Studio, Natur, Wohnzimmer...)')
  }
  
  if (promptLower.length < 30) {
    suggestions.push('✨ Längere, detailliertere Prompts führen zu besseren Ergebnissen')
  }
  
  return suggestions
}

/**
 * Categories for preset filtering in UI
 */
export const IMAGE_PRESET_CATEGORIES = [
  { id: 'brand', label: 'Branding', icon: '✨', description: 'Marken-Posts und Ankündigungen' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🏠', description: 'Authentische Alltagsszenen' },
  { id: 'product', label: 'Produkt', icon: '📦', description: 'Professionelle Produktfotos' },
  { id: 'portrait', label: 'Portrait', icon: '👤', description: 'Personen und Portraits' },
  { id: 'carousel', label: 'Karussell', icon: '🎠', description: 'Multi-Slide Content' },
  { id: 'story', label: 'Story', icon: '📱', description: 'Instagram Stories' },
  { id: 'enhancement', label: 'Verbesserung', icon: '🔧', description: 'Bildoptimierung' },
] as const

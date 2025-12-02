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
// Based on Veo 3.1 Prompt Guide from Google
// Optimized for Instagram Reels, Stories, and Brand Content

export const VIDEO_PRESETS: VideoPreset[] = [
  // ========== TEASER CATEGORY (5) ==========
  {
    id: 'product-reveal-teaser',
    name: 'Produkt-Reveal',
    description: 'Dramatische Enthüllung mit Spannung und Impact',
    category: 'teaser',
    promptTemplate: `Cinematography: Start with a tight close-up on a mysterious shadow or silhouette, slowly pulling back to reveal [PRODUKTNAME] in full glory. Final hero shot with subtle product rotation.
Subject: [PRODUKTNAME] as the star, emerging from darkness or unveiling dramatically.
Action: Slow reveal building anticipation - shadow to light transition, fabric drop, or fog clearing.
Context: Dark, moody background transitioning to bright, clean product spotlight.
Style & Ambiance: Cinematic, dramatic lighting, high contrast, premium commercial feel. Slow motion elements.
Camera: Start macro/close-up, dolly back to medium shot, end with beauty shot.
Audio: Building tension music, dramatic reveal sound, modern ambient beat after reveal.`,
    duration: 6,
    format: '9:16',
    audioType: 'music',
    tags: ['reveal', 'dramatic', 'launch', 'premium', 'cinematic'],
  },
  {
    id: 'coming-soon-teaser',
    name: 'Coming Soon',
    description: 'Geheimnisvoller Teaser für neue Produkte',
    category: 'teaser',
    promptTemplate: `Cinematography: Quick cuts between abstract shapes, blurred product glimpses, and typography reveals.
Subject: Hints of [PRODUKTNAME] - partial views, silhouettes, colors, textures without full reveal.
Action: Fleeting glimpses, quick zooms, mysterious movements creating curiosity.
Context: Dark, atmospheric environment with strategic light beams highlighting hints.
Style & Ambiance: Mysterious, intriguing, premium. Deep shadows, strategic lighting, film noir influence.
Camera: Rapid cuts, shallow depth of field, rack focus effects, lens flares.
Audio: Suspenseful ambient music, whoosh transitions, subtle bass drops.
Text Overlay: "COMING SOON" reveal at the end with brand styling.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['teaser', 'mystery', 'launch', 'anticipation', 'coming-soon'],
  },
  {
    id: 'launch-countdown',
    name: 'Launch-Countdown',
    description: 'Countdown-Animation für Produktlaunches',
    category: 'teaser',
    promptTemplate: `Cinematography: Dynamic countdown sequence with energetic transitions between numbers.
Subject: Bold countdown numbers (3, 2, 1) transitioning to [PRODUKTNAME] reveal.
Action: Numbers animate in dramatically, product appears on final beat.
Context: Energetic, colorful background with particle effects and brand colors.
Style & Ambiance: Exciting, urgent, celebratory. High energy, bold graphics, festival vibes.
Camera: Quick zooms, rotation, dynamic angles on each number.
Audio: Building beat drops on each number, explosive sound on reveal, celebratory music.
Text Overlay: Countdown numbers large and animated, product name on reveal.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['countdown', 'launch', 'exciting', 'dynamic', 'celebration'],
  },
  {
    id: 'feature-spotlight',
    name: 'Feature-Spotlight',
    description: 'Ein besonderes Feature dramatisch hervorheben',
    category: 'teaser',
    promptTemplate: `Cinematography: Extreme close-up on [FEATURE] with slow pull to context shot.
Subject: Specific feature or detail of [PRODUKTNAME] - texture, mechanism, unique element.
Action: Macro detail shot, slow rotation to show 3D quality, zoom out to full product.
Context: Clean studio environment, spotlight on the feature, rest softly lit.
Style & Ambiance: Technical but beautiful, Apple-style product photography, precision feel.
Camera: Macro lens extreme close-up, rack focus, smooth dolly movement.
Audio: Subtle ambient tones, soft click or mechanical sounds if relevant.
Text Overlay: Feature name/benefit appearing subtly during reveal.`,
    duration: 4,
    format: '9:16',
    audioType: 'ambient',
    tags: ['feature', 'detail', 'quality', 'premium', 'technical'],
  },
  {
    id: 'flash-sale-urgent',
    name: 'Flash Sale',
    description: 'Dringliche Sale-Ankündigung mit Countdown',
    category: 'teaser',
    promptTemplate: `Cinematography: Fast-paced cuts, pulsing zoom effects, flashing elements creating urgency.
Subject: [PRODUKTNAME] with bold sale percentage, countdown timer graphic.
Action: Products flash on screen, prices slash dramatically, timer ticks down.
Context: Bold, high-contrast background with sale colors (red, yellow, black).
Style & Ambiance: URGENT, exciting, can't-miss energy. High contrast, bold typography, retail energy.
Camera: Quick zooms, screen shake on impact, rapid transitions.
Audio: Urgent ticking clock, whoosh sounds, bass drops, energetic sale music.
Text Overlay: "FLASH SALE", percentage off, "ENDS SOON" - all animated urgently.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['sale', 'urgent', 'discount', 'flash', 'limited-time'],
  },

  // ========== BEFORE/AFTER CATEGORY (3) ==========
  {
    id: 'transformation-split',
    name: 'Transformation Split',
    description: 'Side-by-side Vorher/Nachher Vergleich',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Split-screen composition, before on left, after on right, with satisfying wipe transition.
Subject: Same [PRODUKTNAME] or scenario in two states - before using product, after using product.
Action: Synchronized camera movement on both sides, wipe reveals the difference dramatically.
Context: Identical setting and lighting on both sides to maximize comparison clarity.
Style & Ambiance: Clean, documentary-style, satisfying transformation reveal. High clarity, good contrast.
Camera: Locked-off or synchronized dolly on both sides, smooth wipe transition.
Audio: Soft ambient music, satisfying "whoosh" on the wipe transition.
Text Overlay: "VORHER" on left, "NACHHER" on right, appearing with the content.`,
    duration: 6,
    format: '9:16',
    audioType: 'music',
    tags: ['before-after', 'transformation', 'comparison', 'results', 'split-screen'],
  },
  {
    id: 'progress-timelapse',
    name: 'Progress-Timelapse',
    description: 'Zeitraffer einer Transformation/Entwicklung',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Timelapse sequence showing gradual transformation over time.
Subject: [PRODUKTNAME] or result changing progressively from start to finish state.
Action: Smooth timelapse of improvement, growth, or transformation process.
Context: Consistent framing throughout to show clear progression.
Style & Ambiance: Documentary feel, satisfying progression, inspiring transformation.
Camera: Locked-off position for clean timelapse, occasional close-up inserts.
Audio: Uplifting progression music, subtle time-passing sounds.
Text Overlay: Optional time markers or stage labels.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['timelapse', 'progress', 'transformation', 'growth', 'journey'],
  },
  {
    id: 'makeover-reveal',
    name: 'Makeover-Reveal',
    description: 'Dramatischer Makeover mit Spannungsaufbau',
    category: 'beforeafter',
    promptTemplate: `Cinematography: Build anticipation with "before" shots, dramatic pause, then stunning "after" reveal.
Subject: Person or object before and after using [PRODUKTNAME] - dramatic improvement.
Action: Show underwhelming "before", building music, dramatic reveal of beautiful "after".
Context: Same location, dramatically better lighting and presentation for "after".
Style & Ambiance: Reality TV makeover energy, dramatic, feel-good, inspiring.
Camera: Emotional close-ups before, wide dramatic reveal shot after.
Audio: Building suspense music, dramatic pause, triumphant reveal music.
Text Overlay: "THE TRANSFORMATION" or similar dramatic text at reveal.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['makeover', 'reveal', 'dramatic', 'transformation', 'inspiring'],
  },

  // ========== STORY CATEGORY (5) ==========
  {
    id: 'day-in-life',
    name: 'Day in the Life',
    description: 'Mini-Vlog mit Produkt im Alltag',
    category: 'story',
    promptTemplate: `Cinematography: POV and third-person mix, authentic handheld movement, natural transitions.
Subject: Person going through their day naturally using [PRODUKTNAME] at key moments.
Action: Morning routine, work/activity, break time, evening - product integrated naturally.
Context: Real-life locations - bedroom, kitchen, office, café, commute.
Style & Ambiance: Authentic, relatable, warm, golden-hour lighting when possible.
Camera: Handheld for authenticity, occasional smooth gimbal shots, smartphone-native look.
Audio: Trendy background music, ASMR moments when using product, ambient life sounds.
Text Overlay: Optional time stamps or day markers.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['vlog', 'day-in-life', 'authentic', 'lifestyle', 'relatable'],
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind the Scenes',
    description: 'Authentischer Einblick hinter die Kulissen',
    category: 'story',
    promptTemplate: `Cinematography: Documentary-style, raw and authentic, candid moments captured naturally.
Subject: The making process of [PRODUKTNAME] - workshop, studio, creative process.
Action: Hands working, team collaborating, mistakes and wins, real moments.
Context: Actual workspace - messy allowed, authentic environment, real people.
Style & Ambiance: Honest, transparent, humanizing the brand, documentary feel.
Camera: Handheld, observational, candid shots, occasional close-ups on details.
Audio: Natural ambient sounds, optional soft music, real conversations snippets.
Text Overlay: "BEHIND THE SCENES" intro, occasional context labels.`,
    duration: 8,
    format: '9:16',
    audioType: 'ambient',
    tags: ['bts', 'authentic', 'process', 'handmade', 'transparent'],
  },
  {
    id: 'quick-tip-hack',
    name: 'Quick-Tip',
    description: 'Schneller Hack oder Tipp in unter 10 Sekunden',
    category: 'story',
    promptTemplate: `Cinematography: Fast-paced, punchy cuts, get straight to the point.
Subject: Quick demonstration of a useful tip using [PRODUKTNAME].
Action: Problem shown briefly, solution demonstrated quickly, result shown.
Context: Relevant environment where the tip would be used.
Style & Ambiance: Informative, valuable, shareable, no fluff content.
Camera: Close-up on action, clear view of technique, fast transitions.
Audio: Upbeat, short music loop, satisfying sound effects on key moments.
Text Overlay: "QUICK TIP" hook, step labels if needed, "SAVE THIS" call-to-action.`,
    duration: 5,
    format: '9:16',
    audioType: 'music',
    tags: ['tip', 'hack', 'quick', 'valuable', 'shareable'],
  },
  {
    id: 'unboxing-experience',
    name: 'Unboxing Experience',
    description: 'ASMR-style Unboxing für maximale Satisfaktion',
    category: 'story',
    promptTemplate: `Cinematography: Close-up focus on hands and packaging, slow deliberate movements, ASMR quality.
Subject: Hands carefully unboxing [PRODUKTNAME], revealing layers and details.
Action: Slow, intentional unboxing - opening, unwrapping, discovering, admiring.
Context: Clean surface, soft lighting, focus entirely on the unboxing experience.
Style & Ambiance: Satisfying, premium, ASMR-like, sensory experience.
Camera: Extreme close-ups, shallow depth of field, smooth slow movements.
Audio: ASMR sounds - paper crinkling, box opening, product sounds. Soft ambient music.
Text Overlay: Minimal - let the experience speak. Maybe "UNBOX WITH ME" intro.`,
    duration: 8,
    format: '9:16',
    audioType: 'ambient',
    tags: ['unboxing', 'asmr', 'satisfying', 'premium', 'experience'],
  },
  {
    id: 'get-ready-with-me',
    name: 'Get Ready With Me',
    description: 'GRWM Format mit Produktintegration',
    category: 'story',
    promptTemplate: `Cinematography: Selfie-style perspective, mirror shots, personal and intimate feel.
Subject: Person getting ready for their day/event, using [PRODUKTNAME] as part of routine.
Action: Step-by-step getting ready process, product integrated naturally.
Context: Bathroom, vanity, bedroom - personal getting-ready space.
Style & Ambiance: Personal, intimate, relatable, influencer-style content.
Camera: Front-facing perspective, mirror reflections, close-ups on product use.
Audio: Chatty voiceover or trending music, ASMR application sounds.
Text Overlay: "GRWM" intro, product callouts, routine steps if needed.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['grwm', 'routine', 'personal', 'relatable', 'influencer'],
  },

  // ========== TUTORIAL CATEGORY (4) ==========
  {
    id: 'step-by-step-guide',
    name: 'Step-by-Step Guide',
    description: 'Nummerierte Anleitung mit klaren Schritten',
    category: 'tutorial',
    promptTemplate: `Cinematography: Clear, well-lit shots of each step, numbered sequence, clean transitions.
Subject: Step-by-step demonstration of using [PRODUKTNAME] correctly.
Action: Each step clearly shown - Step 1, Step 2, Step 3 - with focus on the action.
Context: Clean, organized workspace with good visibility of all steps.
Style & Ambiance: Educational, clear, professional but approachable, helpful.
Camera: Overhead or 45-degree angle for clear view, close-ups on details.
Audio: Clear background music, optional voiceover, step transition sounds.
Text Overlay: Step numbers prominently displayed, key instructions as text.`,
    duration: 10,
    format: '9:16',
    audioType: 'music',
    tags: ['tutorial', 'step-by-step', 'how-to', 'educational', 'guide'],
  },
  {
    id: 'how-to-quick',
    name: 'How-To Quick',
    description: 'Schnelle How-To Anleitung unter 30 Sekunden',
    category: 'tutorial',
    promptTemplate: `Cinematography: Fast-paced but clear, essential steps only, punchy editing.
Subject: Quick demonstration of how to use [PRODUKTNAME] effectively.
Action: Problem → Solution → Result in rapid succession.
Context: Relevant real-world environment where skill would be used.
Style & Ambiance: Efficient, valuable, TikTok-native pacing, no wasted time.
Camera: Dynamic angles, quick cuts, focus on key actions.
Audio: Trending audio or upbeat music, satisfying sound on completion.
Text Overlay: "HOW TO" hook, key steps as quick text, "DONE!" ending.`,
    duration: 6,
    format: '9:16',
    audioType: 'music',
    tags: ['how-to', 'quick', 'efficient', 'hack', 'tiktok'],
  },
  {
    id: 'diy-tutorial',
    name: 'DIY Tutorial',
    description: 'Do-It-Yourself Anleitung mit Ergebnis',
    category: 'tutorial',
    promptTemplate: `Cinematography: Process-focused shots, hands-on crafting, satisfying progression.
Subject: Creating or customizing something using [PRODUKTNAME].
Action: Materials shown, process demonstrated, beautiful result revealed.
Context: Craft workspace, kitchen, or relevant DIY environment.
Style & Ambiance: Creative, inspiring, achievable, satisfying crafting content.
Camera: Overhead for work surface, close-ups on technique, reveal shot at end.
Audio: Crafting ASMR sounds, soft background music, satisfying completion sound.
Text Overlay: Materials list, key technique tips, "YOU MADE THIS!" at end.`,
    duration: 10,
    format: '9:16',
    audioType: 'ambient',
    tags: ['diy', 'craft', 'creative', 'make', 'satisfying'],
  },
  {
    id: 'recipe-cooking',
    name: 'Rezept-Video',
    description: 'Food-Content mit Schritt-für-Schritt Kochen',
    category: 'tutorial',
    promptTemplate: `Cinematography: Appetizing food shots, overhead cooking perspective, sizzling action shots.
Subject: Cooking or preparing [REZEPT] with focus on delicious results.
Action: Ingredients prep, cooking process, plating, final beauty shot.
Context: Kitchen environment, clean cooking setup, good lighting on food.
Style & Ambiance: Mouth-watering, warm, homey, food-porn aesthetic.
Camera: Overhead cooking shots, 45-degree for serving, close-ups on textures.
Audio: Cooking ASMR (sizzling, chopping), soft music, optional voiceover.
Text Overlay: Recipe name, ingredient callouts, cooking tips, "BON APPÉTIT" ending.`,
    duration: 10,
    format: '9:16',
    audioType: 'ambient',
    tags: ['recipe', 'food', 'cooking', 'delicious', 'yummy'],
  },

  // ========== BRAND CATEGORY (4) ==========
  {
    id: 'about-us-story',
    name: 'Über Uns',
    description: 'Emotionale Markengeschichte in Kurzform',
    category: 'brand',
    promptTemplate: `Cinematography: Cinematic brand film style, emotional storytelling, professional production value.
Subject: The story of [MARKE] - founding, mission, values, people behind the brand.
Action: Founder/team moments, product creation, customer impact, brand journey.
Context: Mix of workspace, product shots, team interactions, customer moments.
Style & Ambiance: Emotional, inspiring, authentic, premium brand documentary.
Camera: Cinematic shots, interviews, b-roll, emotional close-ups.
Audio: Emotional brand music, optional founder voiceover, inspiring soundtrack.
Text Overlay: Brand name, founding year, mission statement, "OUR STORY" intro.`,
    duration: 10,
    format: '9:16',
    audioType: 'music',
    tags: ['brand', 'story', 'about-us', 'emotional', 'values'],
  },
  {
    id: 'team-introduction',
    name: 'Team-Vorstellung',
    description: 'Meet the Team Vorstellungsvideo',
    category: 'brand',
    promptTemplate: `Cinematography: Individual portraits transitioning between team members, friendly and approachable.
Subject: Team members of [MARKE] - faces, names, roles, personalities.
Action: Each person waves, smiles, does a signature gesture, or says one line.
Context: Consistent background (office, studio) or each in their workspace.
Style & Ambiance: Friendly, professional, human, welcoming, diverse.
Camera: Medium portrait shots, consistent framing, occasional candid b-roll.
Audio: Upbeat, friendly music, optional quick audio intros from each person.
Text Overlay: Name and role for each person, "MEET THE TEAM" intro.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['team', 'people', 'faces', 'culture', 'introduction'],
  },
  {
    id: 'company-culture',
    name: 'Firmenkultur',
    description: 'Workplace Culture und Teamspirit zeigen',
    category: 'brand',
    promptTemplate: `Cinematography: Documentary-style candid moments, office life, team interactions.
Subject: Day in the life at [MARKE] - workspace, collaboration, fun moments, work ethic.
Action: Team meetings, creative sessions, lunch together, celebrations, focused work.
Context: Office/workspace environment, natural and authentic moments.
Style & Ambiance: Authentic, energetic, inviting, "we're hiring" energy.
Camera: Candid handheld, observational style, mix of wide and close-up shots.
Audio: Upbeat company culture music, ambient office sounds, laughter.
Text Overlay: "LIFE AT [MARKE]" intro, culture value highlights.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['culture', 'workplace', 'team', 'hiring', 'authentic'],
  },
  {
    id: 'customer-testimonial',
    name: 'Kunden-Testimonial',
    description: 'Echte Kundenstimme als Video-Review',
    category: 'brand',
    promptTemplate: `Cinematography: Interview-style with customer, intercut with product/result shots.
Subject: Real customer sharing their experience with [PRODUKTNAME].
Action: Customer speaking authentically, showing product, demonstrating results.
Context: Customer's real environment (home, workspace), natural setting.
Style & Ambiance: Authentic, trustworthy, relatable, social proof.
Camera: Interview framing, cutaway b-roll of product use, genuine expressions.
Audio: Customer voice clear and prominent, subtle background music.
Text Overlay: Customer name/location, key quote highlight, star rating.`,
    duration: 10,
    format: '9:16',
    audioType: 'dialog',
    tags: ['testimonial', 'review', 'customer', 'social-proof', 'authentic'],
  },

  // ========== CINEMATIC CATEGORY (4) ==========
  {
    id: 'product-lifestyle-film',
    name: 'Produkt-Lifestyle Film',
    description: 'Aspirational Lifestyle mit Produkt im Fokus',
    category: 'brand',
    promptTemplate: `Cinematography: High-end commercial style, aspirational lifestyle, beautiful cinematography.
Subject: [PRODUKTNAME] integrated into a desirable, aspirational lifestyle.
Action: Beautiful people using product naturally in stunning environments.
Context: Aspirational locations - modern home, travel destination, premium venue.
Style & Ambiance: Luxury, aspirational, dream-life aesthetic, commercial quality.
Camera: Cinematic shots, drone aerials, golden hour, slow motion moments.
Audio: Premium brand music, cinematic soundtrack, lifestyle sounds.
Text Overlay: Minimal - brand logo subtle, tagline at end.`,
    duration: 8,
    format: '16:9',
    audioType: 'music',
    tags: ['lifestyle', 'aspirational', 'premium', 'cinematic', 'commercial'],
  },
  {
    id: 'mood-film-aesthetic',
    name: 'Mood Film',
    description: 'Atmosphärisches Stimmungsvideo ohne harten Verkauf',
    category: 'brand',
    promptTemplate: `Cinematography: Slow, dreamy, atmospheric shots focused on feeling rather than information.
Subject: [PRODUKTNAME] as part of a mood, feeling, aesthetic rather than feature focus.
Action: Slow, contemplative movements, light play, textures, abstract beauty.
Context: Atmospheric environment matching brand mood - cozy, energetic, minimal, luxe.
Style & Ambiance: Artistic, moody, evocative, brand-feeling rather than brand-telling.
Camera: Slow dolly, abstract angles, selective focus, light leaks, film grain.
Audio: Atmospheric ambient music, nature sounds, artistic soundscape.
Text Overlay: Minimal or none - mood speaks for itself. Brand logo only.`,
    duration: 6,
    format: '9:16',
    audioType: 'ambient',
    tags: ['mood', 'aesthetic', 'artistic', 'atmospheric', 'brand-feel'],
  },
  {
    id: 'nature-product-shot',
    name: 'Natur-Produktszene',
    description: 'Produkt in atemberaubender Naturkulisse',
    category: 'brand',
    promptTemplate: `Cinematography: Epic nature footage with product elegantly placed within the scene.
Subject: [PRODUKTNAME] in a breathtaking natural environment - mountains, ocean, forest, desert.
Action: Nature in motion (waves, wind, clouds), product as beautiful element within.
Context: Stunning natural location that matches brand values (sustainability, adventure, peace).
Style & Ambiance: Epic, beautiful, eco-conscious, adventure or peace depending on brand.
Camera: Wide landscape shots, drone aerials, golden hour, product detail inserts.
Audio: Nature sounds prominent, subtle cinematic music, wind/water sounds.
Text Overlay: Minimal - location name optional, brand tagline about nature/sustainability.`,
    duration: 8,
    format: '16:9',
    audioType: 'ambient',
    tags: ['nature', 'landscape', 'epic', 'sustainability', 'outdoor'],
  },
  {
    id: 'urban-vibes-city',
    name: 'Urban Vibes',
    description: 'Städtische Ästhetik mit Street-Style Energie',
    category: 'brand',
    promptTemplate: `Cinematography: Street-level urban footage, city energy, modern metropolitan vibes.
Subject: [PRODUKTNAME] as part of urban life - city streets, subways, rooftops, cafés.
Action: City life in motion, people walking, traffic, urban rhythm with product naturally present.
Context: Vibrant city environment - downtown, trendy neighborhoods, urban landmarks.
Style & Ambiance: Modern, energetic, street-style, contemporary, gen-z appeal.
Camera: Dynamic handheld, street-level shots, reflections, neon lights, city motion.
Audio: Urban beats, city sounds, modern music, traffic and people ambient.
Text Overlay: City name, street-style typography, brand presence subtle but cool.`,
    duration: 8,
    format: '9:16',
    audioType: 'music',
    tags: ['urban', 'city', 'street', 'modern', 'metropolitan'],
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

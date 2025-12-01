import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Providers } from "@/components/providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing');
  const locale = await getLocale();
  
  const titles: Record<string, string> = {
    de: "InstaAI - KI-gestützte Instagram Content-Erstellung",
    en: "InstaAI - AI-powered Instagram Content Creation",
    tr: "InstaAI - Yapay Zeka Destekli Instagram İçerik Oluşturma"
  };
  
  const descriptions: Record<string, string> = {
    de: "Erstelle beeindruckende Instagram-Inhalte mit KI. Generiere Bilder, Videos, Captions und Hashtags automatisch.",
    en: "Create impressive Instagram content with AI. Generate images, videos, captions and hashtags automatically.",
    tr: "Yapay zeka ile etkileyici Instagram içerikleri oluşturun. Resimler, videolar, açıklamalar ve hashtag'ler otomatik olarak oluşturun."
  };
  
  return {
    title: titles[locale] || titles.de,
    description: descriptions[locale] || descriptions.de,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

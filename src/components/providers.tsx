"use client"

import { SessionProvider } from "next-auth/react"
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl"
import { ThemeProvider } from "next-themes"

interface ProvidersProps {
  children: React.ReactNode
  locale: string
  messages: AbstractIntlMessages
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['de', 'en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Use the cookie locale if valid, otherwise use default
  const locale = locales.includes(localeCookie as Locale) 
    ? localeCookie as Locale 
    : defaultLocale;

  return {
    locale,
    timeZone: 'Europe/Vienna',
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

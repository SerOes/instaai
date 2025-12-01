import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Simple encryption for API keys (use proper encryption in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

export function encryptApiKey(key: string): string {
  // In production, use proper encryption like AES-256
  return Buffer.from(key).toString('base64')
}

export function decryptApiKey(encryptedKey: string): string {
  // In production, use proper decryption
  return Buffer.from(encryptedKey, 'base64').toString('utf-8')
}

// Aspect ratio utilities
export const ASPECT_RATIOS = {
  '1:1': { width: 1080, height: 1080, label: 'Quadrat (1:1)' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait (4:5)' },
  '9:16': { width: 1080, height: 1920, label: 'Story/Reel (9:16)' },
  '16:9': { width: 1920, height: 1080, label: 'Landscape (16:9)' },
} as const

export type AspectRatio = keyof typeof ASPECT_RATIOS

// Supported languages
export const LANGUAGES = {
  de: { name: 'Deutsch', flag: '🇩🇪' },
  en: { name: 'English', flag: '🇬🇧' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
} as const

export type Language = keyof typeof LANGUAGES

// Tone options for captions
export const TONES = [
  { value: 'informative', label: 'Informativ', labelDe: 'Informativ', labelEn: 'Informative', labelTr: 'Bilgilendirici' },
  { value: 'emotional', label: 'Emotional', labelDe: 'Emotional', labelEn: 'Emotional', labelTr: 'Duygusal' },
  { value: 'funny', label: 'Witzig', labelDe: 'Witzig', labelEn: 'Funny', labelTr: 'Komik' },
  { value: 'professional', label: 'Professionell', labelDe: 'Professionell', labelEn: 'Professional', labelTr: 'Profesyonel' },
  { value: 'casual', label: 'Locker', labelDe: 'Locker', labelEn: 'Casual', labelTr: 'Rahat' },
  { value: 'inspiring', label: 'Inspirierend', labelDe: 'Inspirierend', labelEn: 'Inspiring', labelTr: 'İlham Verici' },
] as const

// Style options for image generation
export const IMAGE_STYLES = [
  { value: 'realistic', label: 'Realistisch' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'comic', label: 'Comic' },
  { value: 'pastel', label: 'Pastell' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'modern', label: 'Modern' },
] as const

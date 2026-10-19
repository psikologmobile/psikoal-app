import type { Match } from '../types/match.types'

import { formatTry } from '@/core/utils/formatTry'

export type MatchViewerRole = 'expert' | 'client'

const SESSION_LABELS: Record<string, string> = {
  online: 'Online',
  yüz_yüze: 'Yüz yüze',
  yüz_yüze_online: 'Yüz yüze / Online',
}

export function sessionLabel(sessionType: string | null | undefined): string | null {
  if (!sessionType) return null
  return SESSION_LABELS[sessionType] ?? sessionType
}

/** Teklif fiyatı TL tamsayıdır (ilan bütçesiyle aynı birim). */
export function offerPriceLabel(price: number | null | undefined): string | null {
  return typeof price === 'number' ? formatTry(price * 100) : null
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0] ?? '')
    .join('')
    .toLocaleUpperCase('tr-TR')
}

export type MatchCounterpart = {
  name: string
  initials: string
  /** Kart altı: uzmanın ünvanı ya da "Danışan". */
  subtitle: string
  phone: string | null
  email: string | null
}

/** Görüntüleyenin karşı tarafı: danışan uzmanı, uzman danışanı görür (Revize 2 §5). */
export function toMatchCounterpart(match: Match, viewer: MatchViewerRole): MatchCounterpart {
  if (viewer === 'client') {
    const name = match.expert?.name ?? 'Uzman'
    return {
      name,
      initials: match.expert?.initials || initialsOf(name),
      subtitle: match.expert?.title ?? 'Uzman',
      phone: match.expert?.phone ?? null,
      email: match.expert?.email ?? null,
    }
  }
  const name = match.client?.fullName ?? 'Danışan'
  return {
    name,
    initials: match.client?.initials || initialsOf(name),
    subtitle: 'Danışan',
    phone: match.client?.phone ?? null,
    email: match.client?.email ?? null,
  }
}

/** Kart etiketleri: alan · ücret · görüşme · tarih (yoksa şehir). */
export function matchTags(match: Match, dateLabel: string): string[] {
  return [
    match.listing?.specialization[0] ?? null,
    offerPriceLabel(match.offer?.price),
    sessionLabel(match.offer?.sessionType),
    dateLabel || match.listing?.city || null,
  ].filter((t): t is string => Boolean(t))
}

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const

// Sayının okunuşundaki son ünlüye göre ayrılma eki: 2026 → "altı" → 'dan.
const ONES = ['', 'den', 'den', 'ten', 'ten', 'ten', 'dan', 'den', 'den', 'dan'] as const
const TENS = ['den', 'dan', 'den', 'dan', 'tan', 'den', 'tan', 'ten', 'den', 'dan'] as const

export function yearAblative(year: number): string {
  const ones = year % 10
  if (ones !== 0) return ONES[ones] ?? 'den'
  const tens = Math.floor(year / 10) % 10
  if (tens !== 0) return TENS[tens] ?? 'den'
  // yüz / bin
  return 'den'
}

/** "Mart 2026’dan beri üye" (Eşleşme detayı · uzman görünümü). */
export function memberSinceLabel(createdAt: string | null | undefined): string | null {
  if (!createdAt) return null
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return null
  const year = d.getFullYear()
  return `${MONTHS[d.getMonth()] ?? ''} ${year}’${yearAblative(year)} beri üye`
}

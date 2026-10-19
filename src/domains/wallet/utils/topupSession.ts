import { Platform } from 'react-native'

import { z } from 'zod'

/**
 * Ödeme sayfasına geçmeden önce yüklenecek tutar ve o anki bakiye tarayıcı
 * oturumunda (sessionStorage) saklanır. PayTR dönüşünde (/bakiye/basarili) tam
 * sayfa yeniden yüklendiği için bellekteki durum kaybolur; sonuç sayfası bu kaydı
 * okuyup bakiyenin yansıyıp yansımadığını denetler. Yalnız web.
 */
const TOPUP_SESSION_KEY = 'psikoal.pendingTopup'

export const PendingTopupSchema = z.object({
  amountKurus: z.number().int().positive(),
  amountLabel: z.string(),
  balanceBeforeKurus: z.number().int().min(0),
  startedAt: z.number().int(),
})

export type PendingTopup = z.infer<typeof PendingTopupSchema>

/** Bekleyen yükleme bu süreden eskiyse yok sayılır (sekme günlerce açık kalmış olabilir). */
const PENDING_TTL_MS = 60 * 60 * 1000

function sessionStore(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function savePendingTopup(value: PendingTopup): void {
  try {
    sessionStore()?.setItem(TOPUP_SESSION_KEY, JSON.stringify(value))
  } catch {
    // Depo dolu / kapalı: sonuç sayfası genel metinle çalışır.
  }
}

export function readPendingTopup(now: number = Date.now()): PendingTopup | null {
  try {
    const raw = sessionStore()?.getItem(TOPUP_SESSION_KEY)
    if (!raw) return null
    const parsed = PendingTopupSchema.safeParse(JSON.parse(raw))
    if (!parsed.success || now - parsed.data.startedAt > PENDING_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

export function clearPendingTopup(): void {
  try {
    sessionStore()?.removeItem(TOPUP_SESSION_KEY)
  } catch {
    // yok say
  }
}

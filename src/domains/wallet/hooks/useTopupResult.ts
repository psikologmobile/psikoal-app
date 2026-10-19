import { useEffect, useState } from 'react'

import { useWalletQuery } from '../api'
import { clearPendingTopup, readPendingTopup } from '../utils/topupSession'
import { TOPUP_RESULT_POLL_ATTEMPTS, TOPUP_RESULT_POLL_INTERVAL_MS } from '../wallet.constants'

import type { PendingTopup } from '../utils/topupSession'

/**
 * - checking: bakiye birkaç kez yeniden okunuyor.
 * - confirmed: bakiye beklenen tutar kadar arttı (ödeme callback'i işlendi).
 * - pending: denemeler bitti, bakiye henüz yansımadı (banka onayı / callback gecikmesi).
 * - unknown: bekleyen yükleme kaydı yok (sayfa doğrudan açıldı) — genel metin.
 */
export type TopupResultStatus = 'checking' | 'confirmed' | 'pending' | 'unknown'

export type UseTopupResultReturn = {
  status: TopupResultStatus
  pending: PendingTopup | null
  balanceLabel: string | null
}

/**
 * PayTR başarılı dönüşü (OkUrl) ödemenin KANITI değildir: bakiye sunucuya gelen
 * callback'le yüklenir. Bu yüzden /wallet/me birkaç kez okunur; bakiye beklenen
 * tutara ulaşınca onaylanır, ulaşmazsa "kontrol ediliyor" durumunda kalınır.
 */
export function useTopupResult(): UseTopupResultReturn {
  const [pending] = useState(() => readPendingTopup())
  const [attempts, setAttempts] = useState(0)
  const wallet = useWalletQuery()
  const balance = wallet.data?.balanceKurus
  const { refetch } = wallet

  const confirmed =
    pending !== null &&
    balance !== undefined &&
    balance >= pending.balanceBeforeKurus + pending.amountKurus
  const exhausted = attempts >= TOPUP_RESULT_POLL_ATTEMPTS

  useEffect(() => {
    if (confirmed || exhausted) return
    const timer = setTimeout(() => {
      void refetch()
      setAttempts((n) => n + 1)
    }, TOPUP_RESULT_POLL_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [attempts, confirmed, exhausted, refetch])

  useEffect(() => {
    if (confirmed) clearPendingTopup()
  }, [confirmed])

  let status: TopupResultStatus
  if (confirmed) status = 'confirmed'
  else if (!pending) status = 'unknown'
  else if (!exhausted) status = 'checking'
  else status = 'pending'

  return { status, pending, balanceLabel: wallet.data?.balanceLabel ?? null }
}

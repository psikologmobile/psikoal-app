import { useCallback, useEffect } from 'react'

import { AppState } from 'react-native'

import { useQueryClient } from '@tanstack/react-query'

import { walletKeys } from '../wallet.constants'

type UseWalletForegroundRefreshReturn = {
  /** Cüzdan sorgularını bayat işaretler; aktif olanlar hemen yeniden çekilir. */
  invalidateWallet: () => Promise<void>
}

/**
 * Bakiye web sitesinden yüklenir: uzman tarayıcıdan dönüp uygulamayı öne
 * getirdiğinde bakiye tazelenmeli. `enabled` false iken (danışan) dinleyici kurulmaz.
 */
export function useWalletForegroundRefresh(enabled = true): UseWalletForegroundRefreshReturn {
  const queryClient = useQueryClient()

  const invalidateWallet = useCallback(
    () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
    [queryClient]
  )

  useEffect(() => {
    if (!enabled) return
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void invalidateWallet()
    })
    return () => subscription.remove()
  }, [enabled, invalidateWallet])

  return { invalidateWallet }
}

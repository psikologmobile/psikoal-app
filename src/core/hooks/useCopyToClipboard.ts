import { useCallback, useEffect, useRef, useState } from 'react'

import * as Clipboard from 'expo-clipboard'

import { haptic } from '@/core/motion/haptics'

type UseCopyToClipboardReturn = {
  /** Son kopyalanan anahtar; 1,4 sn sonra null olur (CopyTick tiki için). */
  copiedKey: string | null
  copy: (key: string, text: string) => Promise<void>
}

/** Panoya kopyalar ve `copy-tick` geri bildirimi için anahtarı kısa süre tutar. */
export function useCopyToClipboard(resetMs = 1400): UseCopyToClipboardReturn {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = useCallback(
    async (key: string, text: string) => {
      try {
        await Clipboard.setStringAsync(text)
      } catch {
        // Panoya yazılamadıysa sessiz geç; metin ekranda seçilebilir durur.
        return
      }
      haptic.success()
      setCopiedKey(key)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiedKey(null), resetMs)
    },
    [resetMs]
  )

  return { copiedKey, copy }
}

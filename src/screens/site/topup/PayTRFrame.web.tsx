import { useEffect, useRef } from 'react'

import type { PayTRFrameProps } from './PayTRFrame'

export type { PayTRFrameProps } from './PayTRFrame'

/** PayTR'nin belgelediği yükseklik ayarlayıcı (https://dev.paytr.com/iframe-api). */
const RESIZER_SRC = 'https://www.paytr.com/js/iframeResizer.min.js'
const FRAME_ID = 'paytriframe'

type ResizerWindow = Window & {
  iFrameResize?: (options: Record<string, unknown>, selector: string) => void
}

function loadResizer(onReady: () => void): () => void {
  const win: ResizerWindow = window
  if (win.iFrameResize) {
    onReady()
    return () => undefined
  }
  let script = document.querySelector<HTMLScriptElement>(`script[src="${RESIZER_SRC}"]`)
  if (!script) {
    script = document.createElement('script')
    script.src = RESIZER_SRC
    script.async = true
    document.head.appendChild(script)
  }
  script.addEventListener('load', onReady)
  const current = script
  return () => current.removeEventListener('load', onReady)
}

/**
 * PayTR iFrame (kart alanları PayTR'nin kendi sayfası; tasarlanmaz). Yükseklik
 * PayTR'nin iframeResizer betiğiyle içeriğe göre ayarlanır; betik yüklenemezse
 * en az 600 px yükseklikte kaydırılabilir kalır.
 */
export function PayTRFrame({ src }: PayTRFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(
    () =>
      loadResizer(() => {
        const win: ResizerWindow = window
        if (ref.current) win.iFrameResize?.({}, `#${FRAME_ID}`)
      }),
    [src]
  )

  return (
    <iframe
      ref={ref}
      id={FRAME_ID}
      title="PayTR güvenli ödeme formu"
      src={src}
      // REASON: DOM iframe'i NativeWind sınıfı almaz (RN bileşeni değil); PayTR örneğindeki ölçüler
      style={{ width: '100%', minHeight: 600, border: 0 }}
      allow="payment"
    />
  )
}

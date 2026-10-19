export type PayTRFrameProps = {
  /** POST /payments/paytr/init yanıtındaki iframeUrl. */
  src: string
}

/**
 * PayTR ödeme formu YALNIZ web sitesinde açılır (PayTRFrame.web.tsx). Mobil
 * uygulamada bakiye satın alma yolu yoktur (mağaza kuralı); burada hiçbir şey çizilmez.
 */
export function PayTRFrame(_props: PayTRFrameProps) {
  return null
}

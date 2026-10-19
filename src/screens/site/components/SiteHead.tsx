export type SiteHeadProps = {
  /** Sayfa başlığı; " · PsikoAl" eki otomatik eklenir (ana sayfa hariç). */
  title: string
  description: string
  /** Kök göreli yol (ör. "/uzmanlar-icin"); kanonik adres ve og:url için. */
  path: string
  /** Arama motorları dizinlemesin (ödeme sonucu, 404 …). */
  noIndex?: boolean
}

/**
 * Sayfa <head> etiketleri. Yalnız web'de anlamlı (SiteHead.web.tsx); mobil
 * uygulamada hiçbir şey çizmez.
 */
export function SiteHead(_props: SiteHeadProps) {
  return null
}

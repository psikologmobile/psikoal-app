/**
 * Kuruşu Türkçe TL etiketine çevirir: 125000 → "₺1.250", −62500 → "−₺625".
 *
 * Para etiketleri normalde BACKEND'den hazır gelir (`*Label`). Bu yardımcı yalnız
 * sunucunun henüz görmediği bir tutarın önizlemesi için vardır (ör. bakiye yükleme
 * ekranında elle yazılan tutar). Backend `MoneyLabel.Try` ile birebir aynı kurallar:
 * kuruş gösterilmez, tam TL'ye sıfırdan uzağa yuvarlanır, binlik ayırıcı nokta,
 * eksi işareti U+2212.
 */
const MINUS_SIGN = '−'

function groupThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function formatTry(kurus: number): string {
  // Sıfırdan uzağa yuvarlama (MidpointRounding.AwayFromZero): 50 kuruş → 1 TL.
  const lira = Math.round(Math.abs(kurus) / 100)
  const label = `₺${groupThousands(lira)}`
  return kurus < 0 && lira > 0 ? `${MINUS_SIGN}${label}` : label
}

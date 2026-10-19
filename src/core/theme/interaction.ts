/**
 * Web etkileşim sınıfları (tasarım: b1_Web_* `.hov`, `.of:hover`, `.card:hover`).
 * `web:` öneki native'de hiçbir zaman eşleşmez → native görünüm değişmez.
 */

/** Kart: üzerine gelince −3 px yükselir, çizgisi accent olur. */
export const hoverLift =
  'web:transition web:duration-200 web:hover:-translate-y-[3px] web:hover:border-accent-line'

/** Büyük kart / döşeme: −4 px. */
export const hoverLiftLg =
  'web:transition web:duration-200 web:hover:-translate-y-1 web:hover:border-accent-line'

/** Liste satırı / sekme: üzerine gelince surface zemin. */
export const hoverSurface = 'web:transition-colors web:duration-200 web:hover:bg-surface'

/** `group` içindeki ok: üst öğenin üzerine gelince 4 px sağa kayar (SettingsRow). */
export const hoverNudge = 'web:transition-transform web:duration-200 web:group-hover:translate-x-1'

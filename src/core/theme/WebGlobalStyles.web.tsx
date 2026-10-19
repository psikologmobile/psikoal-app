/**
 * Web genel etkileşim kuralları (tasarım: `a:focus-visible,button:focus-visible
 * {outline:2px solid primary; outline-offset:2px}`, tıklanabilir öğelerde el imleci).
 * React Native Web Pressable'ları `tabindex` + `role` ile çizer; klavyeyle odaklanan
 * HER etkileşimli öğe 2 px primary halka alır. Metin alanları kendi odak çizgisini
 * (border-primary) kullandığı için halka almaz.
 */
const CSS = `
[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],[role="menuitem"],a[href],button{cursor:pointer}
[aria-disabled="true"]{cursor:not-allowed}
[tabindex]:focus-visible,a:focus-visible,button:focus-visible{outline:2px solid rgb(var(--color-focus));outline-offset:2px}
input:focus-visible,textarea:focus-visible{outline:none}
@media (prefers-reduced-motion: reduce){*{transition:none !important}}
`

export function WebGlobalStyles() {
  return (
    <style href="psikoal-web-interactions" precedence="default">
      {CSS}
    </style>
  )
}

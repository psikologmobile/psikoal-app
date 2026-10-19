import type { ComponentType } from 'react'

import { Redirect } from 'expo-router'

type GalleryModule = { Gallery: ComponentType }

// Geliştirici bileşen galerisi (/dev-gallery). Üretim derlemesinde __DEV__
// false olduğundan Metro bu dalı ve galeri modülünü pakete hiç almaz; rota
// açılırsa ana sayfaya yönlendirilir.
// REASON: koşullu require tipsiz döner; modülün tek dışa aktarımı bilinir.
const Gallery: ComponentType | null = __DEV__
  ? (require('@/dev/gallery/Gallery') as GalleryModule).Gallery
  : null

export default function DevGalleryRoute() {
  if (!Gallery) return <Redirect href="/" />
  return <Gallery />
}

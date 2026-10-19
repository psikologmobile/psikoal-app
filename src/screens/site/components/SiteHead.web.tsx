import Head from 'expo-router/head'

import { SITE_NAME } from '../siteDocument'

import type { SiteHeadProps } from './SiteHead'

import { env } from '@/lib/env'

export type { SiteHeadProps } from './SiteHead'

/** Başlık, açıklama, kanonik adres ve Open Graph etiketleri (static render'a girer). */
export function SiteHead({ title, description, path, noIndex = false }: SiteHeadProps) {
  const fullTitle = path === '/' ? title : `${title} · ${SITE_NAME}`
  const base = env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const url = base ? `${base}${path}` : undefined
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url ? <meta property="og:url" content={url} /> : null}
      {url ? <link rel="canonical" href={url} /> : null}
      {noIndex ? <meta name="robots" content="noindex" /> : null}
    </Head>
  )
}

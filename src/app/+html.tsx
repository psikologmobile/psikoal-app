import type { PropsWithChildren } from 'react'

import { ScrollViewStyleReset } from 'expo-router/html'

import { SITE_NAME, SITE_SESSION_SCRIPT, SITE_STYLES } from '@/screens/site/siteDocument'

/**
 * Web derlemesinin (static output) kök HTML'i — YALNIZ web'de, Node ortamında çalışır;
 * tarayıcı API'si kullanılmaz. Sayfa başlığı/açıklaması sayfalardaki <SiteHead> ile
 * değişir (expo-router/head); buradakiler varsayılanlardır.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#FAFAFA" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        {/* Kayıtlı oturum varsa tanıtım sayfası hidrasyona kadar gizlenir (bkz. siteDocument). */}
        <script dangerouslySetInnerHTML={{ __html: SITE_SESSION_SCRIPT }} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      </head>
      <body>{children}</body>
    </html>
  )
}

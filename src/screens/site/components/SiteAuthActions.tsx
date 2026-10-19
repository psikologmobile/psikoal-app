import { SITE_ROUTES, loginHref } from '../siteRoutes'
import { useSiteSession } from '../useSiteSession'

import { SiteButton } from './SiteButton'

/**
 * Üst menünün sağ tarafı: oturumsuz "Giriş yap" + "Web'de kullan", oturumlu
 * "Uygulamaya git". Statik HTML oturumsuz sürümdür.
 */
export function SiteAuthActions({ primaryLabel = "Web'de kullan" }: { primaryLabel?: string }) {
  const { isAuthenticated } = useSiteSession()
  if (isAuthenticated) {
    return <SiteButton href={SITE_ROUTES.home} label="Uygulamaya git" />
  }
  return (
    <>
      <SiteButton href={loginHref()} label="Giriş yap" variant="ghost" />
      <SiteButton href={loginHref()} label={primaryLabel} />
    </>
  )
}

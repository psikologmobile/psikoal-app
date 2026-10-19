import { PasswordPrivacyScreen } from '@/screens/settings'
import { AppWebShell } from '@/screens/shell'

/** /profile/privacy — "Şifre ve gizlilik" ile aynı ekran (Ayarlar → Veri ve gizlilik). */
export default function PrivacyRoute() {
  return (
    <AppWebShell>
      <PasswordPrivacyScreen />
    </AppWebShell>
  )
}

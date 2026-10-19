import { PasswordPrivacyScreen } from '@/screens/settings'
import { AppWebShell } from '@/screens/shell'

export default function PasswordRoute() {
  return (
    <AppWebShell>
      <PasswordPrivacyScreen />
    </AppWebShell>
  )
}

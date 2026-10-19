import { PersonalInfoScreen } from '@/screens/settings'
import { AppWebShell } from '@/screens/shell'

export default function PersonalInfoRoute() {
  return (
    <AppWebShell>
      <PersonalInfoScreen />
    </AppWebShell>
  )
}

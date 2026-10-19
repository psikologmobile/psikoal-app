import { ProfessionalProfileScreen } from '@/screens/profile/ProfessionalProfileScreen'
import { AppWebShell } from '@/screens/shell'

/** /profile/professional?tab=belgeler — mesleki bilgiler ve belgeler. */
export default function ProfessionalProfileRoute() {
  return (
    <AppWebShell>
      <ProfessionalProfileScreen />
    </AppWebShell>
  )
}

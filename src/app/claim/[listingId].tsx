import { ClaimScreen } from '@/screens/claim/ClaimScreen'
import { AppWebShell } from '@/screens/shell'

/** /claim/[listingId] — uzmanın "Danışanla anlaştım" bildirimi. */
export default function ClaimRoute() {
  return (
    <AppWebShell>
      <ClaimScreen />
    </AppWebShell>
  )
}

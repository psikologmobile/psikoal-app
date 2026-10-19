import { AppWebShell } from '@/screens/shell'
import { ReferralScreen } from '@/screens/wallet/ReferralScreen'

/** /referral — uzmanın kişisel davet linki. */
export default function ReferralRoute() {
  return (
    <AppWebShell>
      <ReferralScreen />
    </AppWebShell>
  )
}

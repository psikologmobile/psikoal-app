import { AppWebShell } from '@/screens/shell'
import { WalletScreen } from '@/screens/wallet/WalletScreen'

/** /wallet — uzman "Bakiyem". */
export default function WalletRoute() {
  return (
    <AppWebShell>
      <WalletScreen />
    </AppWebShell>
  )
}

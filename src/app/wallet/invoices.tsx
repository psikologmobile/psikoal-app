import { AppWebShell } from '@/screens/shell'
import { WalletInvoicesScreen } from '@/screens/wallet/WalletInvoicesScreen'

/** /wallet/invoices — "Faturalarım". */
export default function WalletInvoicesRoute() {
  return (
    <AppWebShell>
      <WalletInvoicesScreen />
    </AppWebShell>
  )
}

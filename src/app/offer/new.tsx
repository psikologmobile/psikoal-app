import { SendOfferScreen } from '@/screens/offer/SendOfferScreen'
import { AppWebShell } from '@/screens/shell'

/** /offer/new?listingId= — uzman teklif gönderir. */
export default function NewOfferRoute() {
  return (
    <AppWebShell>
      <SendOfferScreen />
    </AppWebShell>
  )
}

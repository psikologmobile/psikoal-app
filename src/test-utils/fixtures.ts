// Barrel yerine şemalar doğrudan: barrel api katmanını (AsyncStorage) yükler.
import type { Listing } from '@/domains/listing/types/listing.types'
import type { Offer } from '@/domains/offer/types/offer.types'

import listingFixtures from '@/domains/listing/schemas/__fixtures__/listings.response.json'
import { ListingSchema } from '@/domains/listing/schemas/listing.schema'
import offerFixtures from '@/domains/offer/schemas/__fixtures__/listing-offers.response.json'
import { OfferSchema } from '@/domains/offer/schemas/offer.schema'

/** Danışan görünümündeki ilan (sözleşme fixture'ı) + alan ezmeleri. */
export function makeListing(overrides: Partial<Listing> = {}): Listing {
  return { ...ListingSchema.parse(listingFixtures.clientView), ...overrides }
}

/** Danışanın gördüğü teklif (sözleşme fixture'ı) + alan ezmeleri. */
export function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return { ...OfferSchema.parse(offerFixtures.data[0]), ...overrides }
}

import { Text } from 'react-native'

import ListingDetailRoute from '@/app/listing/[id]'
import OfferDetailRoute from '@/app/offer/[id]'
import { useAuthStore } from '@/domains/auth'
import { mockSearchParams, renderScreen } from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)

function mockStub(label: string) {
  return function Stub(props: { listingId?: string; offerId?: string }) {
    return <Text>{`${label} ${props.listingId ?? props.offerId ?? ''}`}</Text>
  }
}

jest.mock('@/screens/listing', () => ({
  ClientListingDetailScreen: mockStub('danışan ilan'),
  ExpertListingDetailScreen: mockStub('uzman ilan'),
}))
jest.mock('@/screens/offer', () => ({
  ClientOfferDetailScreen: mockStub('danışan teklif'),
  ExpertOfferDetailScreen: mockStub('uzman teklif'),
}))

describe('rol ayrımı yapan route dosyaları', () => {
  it('ilan ve teklif detayını role göre çizer', () => {
    mockSearchParams.current = { id: 'x1' }
    useAuthStore.setState({ role: 'client' })
    expect(renderScreen(<ListingDetailRoute />).getByText('danışan ilan x1')).toBeTruthy()
    expect(renderScreen(<OfferDetailRoute />).getByText('danışan teklif x1')).toBeTruthy()
    useAuthStore.setState({ role: 'expert' })
    expect(renderScreen(<ListingDetailRoute />).getByText('uzman ilan x1')).toBeTruthy()
    expect(renderScreen(<OfferDetailRoute />).getByText('uzman teklif x1')).toBeTruthy()
  })
})

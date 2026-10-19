import { fireEvent, render } from '@testing-library/react-native'

import { ActiveListingCard } from './ActiveListingCard'
import { AdCard } from './AdCard'
import { MATCH_CONFIRM_TEXT, MatchConfirmSheet } from './MatchConfirmSheet'

import { makeListing } from '@/test-utils/fixtures'

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

describe('AdCard', () => {
  it('durum, hatırlatma ve alt satırı gösterir', () => {
    const onPress = jest.fn()
    const { getByText, getByLabelText } = render(
      <AdCard
        listing={makeListing({ status: 'OPEN', offerCount: 4, expiresAt: null })}
        onPress={onPress}
      />
    )
    expect(getByText('Yayında')).toBeTruthy()
    expect(getByText('Hatırlatma var')).toBeTruthy()
    expect(getByText('4 teklif')).toBeTruthy()
    fireEvent.press(getByLabelText(/^Yayında: /))
    expect(onPress).toHaveBeenCalled()
  })

  it('reddedilen ilanda gerekçeyi özet olarak verir', () => {
    const { getByText, queryByText } = render(
      <AdCard
        listing={makeListing({ status: 'REJECTED_BY_ADMIN', rejectionReason: 'Yetersiz' })}
        onPress={jest.fn()}
      />
    )
    expect(getByText('Reddedildi')).toBeTruthy()
    expect(getByText('Gerekçe: Yetersiz')).toBeTruthy()
    expect(queryByText('Hatırlatma var')).toBeNull()
  })
})

describe('ActiveListingCard', () => {
  it('teklif veren uzmanları ve son teklif zamanını gösterir', () => {
    const { getByText, getByLabelText } = render(
      <ActiveListingCard
        listing={makeListing({ status: 'OPEN', offerCount: 2, expiresAt: null })}
        experts={[{ initials: 'EK' }, { initials: 'MA' }]}
        lastOfferLabel="Son teklif 12 dk önce"
        onPress={jest.fn()}
      />
    )
    expect(getByText('Yayında')).toBeTruthy()
    expect(getByText('2 teklif')).toBeTruthy()
    expect(getByText('Son teklif 12 dk önce')).toBeTruthy()
    expect(getByLabelText('2 uzman teklif verdi')).toBeTruthy()
  })
})

describe('MatchConfirmSheet', () => {
  it('başlık, açıklama, Vazgeç / Eşleş', () => {
    const onCancel = jest.fn()
    const onConfirm = jest.fn()
    const { getByText } = render(
      <MatchConfirmSheet
        target={{ offerId: 'o1', expertName: 'Elif Kaya', expertInitials: 'EK' }}
        onCancel={onCancel}
        onConfirm={onConfirm}
        errorMessage="İlan artık açık değil"
      />
    )
    expect(getByText('Elif Kaya ile eşleşilsin mi?')).toBeTruthy()
    expect(getByText(MATCH_CONFIRM_TEXT)).toBeTruthy()
    expect(getByText('İlan artık açık değil')).toBeTruthy()
    fireEvent.press(getByText('Eşleş'))
    fireEvent.press(getByText('Vazgeç'))
    expect(onConfirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('hedef yoksa çizilmez', () => {
    const { queryByText } = render(
      <MatchConfirmSheet target={null} onCancel={jest.fn()} onConfirm={jest.fn()} />
    )
    expect(queryByText('Eşleş')).toBeNull()
  })
})

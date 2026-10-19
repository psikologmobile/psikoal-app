import { fireEvent, render } from '@testing-library/react-native'

import { OfferCard } from './OfferCard'

import { makeOffer } from '@/test-utils/fixtures'

describe('OfferCard', () => {
  it('uzman, ücret, rozet ve eylemler', () => {
    const onProfile = jest.fn()
    const onDetail = jest.fn()
    const onAgree = jest.fn()
    const { getByText } = render(
      <OfferCard
        offer={makeOffer({ status: 'PENDING' })}
        claimed
        showActions
        onProfile={onProfile}
        onDetail={onDetail}
        onAgree={onAgree}
      />
    )
    expect(getByText('Mehmet Demir')).toBeTruthy()
    expect(getByText('₺1.350')).toBeTruthy()
    expect(getByText('Anlaştık dedi')).toBeTruthy()
    expect(getByText('Online')).toBeTruthy()
    fireEvent.press(getByText('Profil'))
    fireEvent.press(getByText('Detay'))
    fireEvent.press(getByText('Anlaştım'))
    expect(onProfile).toHaveBeenCalled()
    expect(onDetail).toHaveBeenCalled()
    expect(onAgree).toHaveBeenCalled()
  })

  it('eylemsiz ve uzmansız teklif', () => {
    const { getByText, queryByText } = render(
      <OfferCard offer={makeOffer({ expert: null, title: null, description: '' })} />
    )
    expect(getByText('Uzman')).toBeTruthy()
    expect(queryByText('Anlaştım')).toBeNull()
    expect(queryByText('Anlaştık dedi')).toBeNull()
  })
})

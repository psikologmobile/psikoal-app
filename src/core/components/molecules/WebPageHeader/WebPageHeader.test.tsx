import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { InfoTile } from '../InfoTile'

import { WebPageHeader } from './WebPageHeader'

describe('WebPageHeader', () => {
  it('başlık, selam, geri bağlantısı ve sağ eylem', () => {
    const onBack = jest.fn()
    const view = render(
      <WebPageHeader
        title="Fırsatlar"
        greeting="Merhaba, Elif"
        backLabel="Keşfet"
        onBack={onBack}
        eyebrow={<Text>Davet edildin</Text>}
        subtitle="Açıklama"
        right={<Text>Sırala</Text>}
        size="sm"
      />
    )
    expect(view.getByRole('header')).toHaveTextContent('Fırsatlar')
    expect(view.getByText('Merhaba, Elif')).toBeTruthy()
    expect(view.getByText('Davet edildin')).toBeTruthy()
    expect(view.getByText('Açıklama')).toBeTruthy()
    expect(view.getByText('Sırala')).toBeTruthy()
    fireEvent.press(view.getByLabelText('Geri: Keşfet'))
    expect(onBack).toHaveBeenCalled()
  })

  it('özel alt başlık düğümü; geri bağlantısı yok', () => {
    const view = render(<WebPageHeader title="Bakiyem" subtitle={<Text>özel</Text>} />)
    expect(view.getByText('özel')).toBeTruthy()
    expect(view.queryByRole('link')).toBeNull()
  })
})

describe('InfoTile', () => {
  it('etiket ve değer', () => {
    const view = render(<InfoTile label="Bütçe" value="₺2.000–3.000" />)
    expect(view.getByLabelText('Bütçe: ₺2.000–3.000')).toBeTruthy()
    render(<InfoTile label="Seans ücreti" value="₺2.400" emphasis />)
  })
})

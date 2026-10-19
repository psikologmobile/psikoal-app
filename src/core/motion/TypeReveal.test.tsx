import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { TypeReveal } from './TypeReveal'
import { setReduceMotionOverride } from './useReduceMotion'

afterEach(() => setReduceMotionOverride(null))

describe('TypeReveal', () => {
  it('renders the text with a mask that animates after layout', () => {
    const { getByText, UNSAFE_root } = render(
      <TypeReveal maskClassName="bg-surface">
        <Text>Teklif notu</Text>
      </TypeReveal>
    )
    expect(getByText('Teklif notu')).toBeTruthy()
    const box = UNSAFE_root.findAll((node) => typeof node.props.onLayout === 'function')[0]
    if (!box) throw new Error('layout kutusu yok')
    fireEvent(box, 'layout', { nativeEvent: { layout: { width: 300, height: 40 } } })
    expect(getByText('Teklif notu')).toBeTruthy()
  })

  it('skips the mask under reduce motion', () => {
    setReduceMotionOverride(true)
    const { getByText } = render(
      <TypeReveal>
        <Text>Anında</Text>
      </TypeReveal>
    )
    expect(getByText('Anında')).toBeTruthy()
  })
})

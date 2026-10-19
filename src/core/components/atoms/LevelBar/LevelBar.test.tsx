import { fireEvent, render } from '@testing-library/react-native'

import { LevelBar } from './LevelBar'

describe('LevelBar', () => {
  it('renders the three zone labels and progress value', () => {
    const { getByText, getByRole } = render(
      <LevelBar position={0.5} accessibilityLabel="Seviye: Orta" />
    )
    expect(getByText('Düşük')).toBeTruthy()
    expect(getByText('Orta')).toBeTruthy()
    expect(getByText('Yüksek')).toBeTruthy()
    expect(getByRole('progressbar').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 })
  })

  it('accepts custom labels and measures its track width', () => {
    const { getByText, UNSAFE_root } = render(
      <LevelBar position={1} labels={['Az', 'Orta', 'Çok']} />
    )
    expect(getByText('Çok')).toBeTruthy()
    const track = UNSAFE_root.findAll((n) => typeof n.props.onLayout === 'function')[0]
    expect(track).toBeTruthy()
    if (track) fireEvent(track, 'layout', { nativeEvent: { layout: { width: 300, height: 10 } } })
  })
})

import { Text } from 'react-native'

import { render } from '@testing-library/react-native'

import { ScoreRing } from './ScoreRing'

describe('ScoreRing', () => {
  it('exposes the score as progressbar and renders center content', () => {
    const { getByRole, getByText } = render(
      <ScoreRing value={14} max={21}>
        <Text>on dört</Text>
      </ScoreRing>
    )
    const ring = getByRole('progressbar')
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 21, now: 14 })
    expect(ring.props.accessibilityLabel).toBe('14 / 21')
    expect(getByText('on dört')).toBeTruthy()
  })

  it('handles zero max and custom size/label', () => {
    const { getByLabelText } = render(
      <ScoreRing value={3} max={0} size={96} strokeWidth={8} accessibilityLabel="Skor" />
    )
    expect(getByLabelText('Skor').props.style).toEqual({ width: 96, height: 96 })
  })
})

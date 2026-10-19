import { render } from '@testing-library/react-native'

import { VerifiedBadge } from './VerifiedBadge'

describe('VerifiedBadge', () => {
  it('renders an accessible image with the given size', () => {
    const { getByLabelText } = render(<VerifiedBadge size={24} />)
    const el = getByLabelText('Doğrulanmış')
    expect(el.props.accessibilityRole).toBe('image')
    expect(el.props.style).toEqual({ width: 24, height: 24 })
  })

  it('accepts a custom label', () => {
    const { getByLabelText } = render(<VerifiedBadge accessibilityLabel="Onaylı uzman" delay={0} />)
    expect(getByLabelText('Onaylı uzman')).toBeTruthy()
  })
})

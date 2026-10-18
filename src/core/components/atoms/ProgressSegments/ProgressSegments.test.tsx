import { render } from '@testing-library/react-native'

import { ProgressSegments } from './ProgressSegments'

describe('ProgressSegments', () => {
  it('exposes progressbar role and value', () => {
    const { getByRole } = render(<ProgressSegments total={7} current={3} />)
    const bar = getByRole('progressbar')
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 7, now: 3 })
    expect(bar.props.accessibilityLabel).toBe('Adım 3 / 7')
  })

  it('clamps current to total and accepts a custom label', () => {
    const { getByLabelText } = render(
      <ProgressSegments total={3} current={9} variant="thin" accessibilityLabel="Şifre gücü" />
    )
    expect(getByLabelText('Şifre gücü').props.accessibilityValue.now).toBe(3)
  })

  it('renders dot variant', () => {
    const { toJSON } = render(<ProgressSegments total={4} current={2} variant="dots" />)
    const json = JSON.stringify(toJSON())
    expect(json).toContain('w-5')
    expect(json).toContain('w-2 bg-border')
  })
})

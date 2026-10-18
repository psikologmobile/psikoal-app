import { render } from '@testing-library/react-native'

import { CountBadge } from './CountBadge'

describe('CountBadge', () => {
  it('renders the count with an accessible label', () => {
    const { getByText, getByLabelText } = render(<CountBadge count={3} />)
    expect(getByText('3')).toBeTruthy()
    expect(getByLabelText('3 okunmamış').props.className).toContain('border-bg')
  })

  it('caps the count at max', () => {
    const { getByText } = render(<CountBadge count={120} max={99} />)
    expect(getByText('99+')).toBeTruthy()
  })

  it('renders nothing for zero', () => {
    const { toJSON } = render(<CountBadge count={0} />)
    expect(toJSON()).toBeNull()
  })

  it('can drop the ring', () => {
    const { getByLabelText } = render(<CountBadge count={1} ring={false} popDelay={1000} />)
    expect(getByLabelText('1 okunmamış').props.className).not.toContain('border-bg')
  })
})

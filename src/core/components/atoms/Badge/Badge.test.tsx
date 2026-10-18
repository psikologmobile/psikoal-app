import React from 'react'

import { render } from '@testing-library/react-native'

import { Badge } from './Badge'

describe('Badge', () => {
  it('renders label', () => {
    const { getByText } = render(<Badge label="Active" />)
    expect(getByText('Active')).toBeTruthy()
  })

  it('renders all variants without crashing', () => {
    const variants = ['sky', 'sage', 'success', 'warning', 'error', 'neutral', 'info'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<Badge label={variant} variant={variant} />)
      unmount()
    })
  })

  it('renders both sizes without crashing', () => {
    const { getByText: getBySm } = render(<Badge label="Small" size="sm" />)
    expect(getBySm('Small')).toBeTruthy()
    const { getByText: getByMd } = render(<Badge label="Medium" size="md" />)
    expect(getByMd('Medium')).toBeTruthy()
  })

  it('renders dot indicator when dot is true', () => {
    const { UNSAFE_getAllByType } = render(<Badge label="Online" variant="success" dot />)
    const { View } = require('react-native')
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThanOrEqual(2)
  })

  it('does not render dot when dot is false', () => {
    const { UNSAFE_queryAllByProps } = render(
      <Badge label="Offline" variant="success" dot={false} />
    )
    const dots = UNSAFE_queryAllByProps({
      className: expect.stringContaining('bg-semantic-success rounded-full'),
    })
    expect(dots.length).toBe(0)
  })

  it('renders icon when provided', () => {
    const TestIcon = () => <React.Fragment />
    const { getByText } = render(<Badge label="With icon" icon={<TestIcon />} />)
    expect(getByText('With icon')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { UNSAFE_getByProps } = render(<Badge label="Custom" className="opacity-80" />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'text' })
    expect(el.props.className).toContain('opacity-80')
  })

  it('has neutral variant by default', () => {
    const { UNSAFE_getByProps } = render(<Badge label="Default" />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'text' })
    expect(el.props.className).toContain('border-border-strong')
  })
})

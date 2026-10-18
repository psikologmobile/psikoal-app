import React from 'react'

import { render } from '@testing-library/react-native'

import { Divider } from './Divider'

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    const { UNSAFE_getByProps } = render(<Divider />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(el).toBeTruthy()
    expect(el.props.className).toContain('w-full')
    expect(el.props.className).toContain('h-[1.5px]')
  })

  it('renders vertical divider', () => {
    const { UNSAFE_getByProps } = render(<Divider orientation="vertical" />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(el.props.className).toContain('w-[1.5px]')
    expect(el.props.className).toContain('self-stretch')
  })

  it('renders label in the middle', () => {
    const { getByText } = render(<Divider label="OR" />)
    expect(getByText('OR')).toBeTruthy()
  })

  it('applies default color class', () => {
    const { UNSAFE_getByProps } = render(<Divider />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(el.props.className).toContain('bg-border')
  })

  it('applies strong color class', () => {
    const { UNSAFE_getByProps } = render(<Divider color="strong" />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(el.props.className).toContain('bg-border-strong')
  })

  it('applies spacing class', () => {
    const { UNSAFE_getByProps } = render(<Divider spacing="lg" />)
    const el = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(el.props.className).toContain('my-6')
  })

  it('renders all spacing variants without crashing', () => {
    const spacings = ['none', 'sm', 'md', 'lg'] as const
    spacings.forEach((spacing) => {
      const { unmount } = render(<Divider spacing={spacing} />)
      unmount()
    })
  })

  it('renders all color variants without crashing', () => {
    const colors = ['default', 'muted', 'strong', 'brand'] as const
    colors.forEach((color) => {
      const { unmount } = render(<Divider color={color} />)
      unmount()
    })
  })
})

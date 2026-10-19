import React from 'react'

import { render } from '@testing-library/react-native'

import { Text } from './Text'

describe('Text', () => {
  it('renders children', () => {
    const { getByText } = render(<Text>Hello World</Text>)
    expect(getByText('Hello World')).toBeTruthy()
  })

  it('renders all variants without crashing', () => {
    const variants = [
      'display',
      'heading',
      'subheading',
      'body',
      'label',
      'caption',
      'overline',
    ] as const
    variants.forEach((variant) => {
      const { getByText } = render(<Text variant={variant}>{variant}</Text>)
      expect(getByText(variant)).toBeTruthy()
    })
  })

  it('renders all color variants without crashing', () => {
    const colors = [
      'primary',
      'secondary',
      'tertiary',
      'disabled',
      'inverse',
      'brand',
      'accent',
      'success',
      'warning',
      'error',
    ] as const
    colors.forEach((color) => {
      const { getByText } = render(<Text color={color}>{color}</Text>)
      expect(getByText(color)).toBeTruthy()
    })
  })

  it('renders all weight variants without crashing', () => {
    const weights = ['light', 'regular', 'medium', 'semibold', 'bold', 'extrabold'] as const
    weights.forEach((weight) => {
      const { getByText } = render(<Text weight={weight}>{weight}</Text>)
      expect(getByText(weight)).toBeTruthy()
    })
  })

  it('renders all align variants without crashing', () => {
    const aligns = ['left', 'center', 'right'] as const
    aligns.forEach((align) => {
      const { getByText } = render(<Text align={align}>{align}</Text>)
      expect(getByText(align)).toBeTruthy()
    })
  })

  it('forwards numberOfLines prop', () => {
    const { getByText } = render(<Text numberOfLines={2}>Truncated text</Text>)
    const el = getByText('Truncated text')
    expect(el.props.numberOfLines).toBe(2)
  })

  it('forwards accessibilityLabel prop', () => {
    const { getByLabelText } = render(<Text accessibilityLabel="greeting">Hello</Text>)
    expect(getByLabelText('greeting')).toBeTruthy()
  })

  it('merges custom className', () => {
    const { getByText } = render(<Text className="mt-4">Spaced</Text>)
    const el = getByText('Spaced')
    expect(el.props.className).toContain('mt-4')
  })

  it('applies variant className', () => {
    const { getByText } = render(<Text variant="heading">Title</Text>)
    const el = getByText('Title')
    expect(el.props.className).toContain('font-display')
    expect(el.props.className).toContain('text-h2')
  })

  it('custom weight overrides variant default weight', () => {
    const { getByText } = render(
      <Text variant="body" weight="bold">
        Bold body
      </Text>
    )
    const el = getByText('Bold body')
    expect(el.props.className).toContain('font-body-bold')
    expect(el.props.className).not.toContain('font-body ')
  })

  it('maps weight to display family on display variants', () => {
    const { getByText } = render(
      <Text variant="h1" weight="bold">
        Başlık
      </Text>
    )
    expect(getByText('Başlık').props.className).toContain('font-display-bold')
  })

  it('renders every v2 variant and color', () => {
    const variants = [
      'hero',
      'h1',
      'h2',
      'h3',
      'sheet',
      'title',
      'number',
      'bodyLg',
      'body',
      'bodySm',
      'label',
      'button',
      'badge',
      'overline',
      'caption',
    ] as const
    variants.forEach((v) => {
      const { getByText, unmount } = render(<Text variant={v}>{v}</Text>)
      expect(getByText(v)).toBeTruthy()
      unmount()
    })
    const colors = [
      'default',
      'muted',
      'link',
      'onPrimary',
      'onAccent',
      'onAccentMuted',
      'onAccentSoft',
      'danger',
      'onDangerSoft',
      'onDanger',
      'inherit',
    ] as const
    colors.forEach((c) => {
      const { getByText, unmount } = render(<Text color={c}>{c}</Text>)
      expect(getByText(c)).toBeTruthy()
      unmount()
    })
  })

  it('keeps size and color classes side by side (tailwind-merge config)', () => {
    const { getByText } = render(
      <Text variant="body" color="muted">
        Metin
      </Text>
    )
    const cls = getByText('Metin').props.className
    expect(cls).toContain('text-body')
    expect(cls).toContain('text-fg-muted')
  })
})

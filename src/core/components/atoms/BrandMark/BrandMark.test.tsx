import React from 'react'

import { render } from '@testing-library/react-native'

import { BrandMark, BRAND_NAME } from './BrandMark'

describe('BrandMark', () => {
  it('renders the brand wordmark with an accessible label', () => {
    const { getByText, getByLabelText } = render(<BrandMark />)
    expect(getByText(BRAND_NAME)).toBeTruthy()
    expect(getByLabelText(BRAND_NAME)).toBeTruthy()
  })

  it('uses the larger text size by default', () => {
    const { getByText } = render(<BrandMark />)
    expect(getByText(BRAND_NAME).props.className).toContain('text-2xl')
  })

  it('supports the small size', () => {
    const { getByText } = render(<BrandMark size="sm" />)
    expect(getByText(BRAND_NAME).props.className).toContain('text-xl')
  })

  it('merges a custom className', () => {
    const { getByLabelText } = render(<BrandMark className="self-start" />)
    expect(getByLabelText(BRAND_NAME).props.className).toContain('self-start')
  })

  it('is a header by default and can opt out', () => {
    const { getByLabelText, rerender } = render(<BrandMark />)
    expect(getByLabelText(BRAND_NAME).props.accessibilityRole).toBe('header')
    rerender(<BrandMark asHeader={false} />)
    expect(getByLabelText(BRAND_NAME).props.accessibilityRole).toBeUndefined()
  })
})

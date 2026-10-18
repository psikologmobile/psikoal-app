import React from 'react'

import { fireEvent, render } from '@testing-library/react-native'

import { Chip } from './Chip'

describe('Chip — filter variant', () => {
  it('renders label', () => {
    const { getByText } = render(<Chip label="Sports" />)
    expect(getByText('Sports')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<Chip label="Sports" onPress={onPress} />)
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<Chip label="Sports" onPress={onPress} isDisabled />)
    fireEvent.press(getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('reflects unselected state by default', () => {
    const { getByRole } = render(<Chip label="Yoga" onPress={jest.fn()} />)
    expect(getByRole('button').props.accessibilityState?.selected).toBe(false)
  })

  it('reflects selected state when isSelected is true', () => {
    const { getByRole } = render(<Chip label="Yoga" onPress={jest.fn()} isSelected />)
    expect(getByRole('button').props.accessibilityState?.selected).toBe(true)
  })

  it('applies selected styles when isSelected', () => {
    const { getByRole } = render(<Chip label="Yoga" onPress={jest.fn()} isSelected />)
    expect(getByRole('button').props.className).toContain('bg-accent')
  })

  it('applies unselected styles when not selected', () => {
    const { getByRole } = render(<Chip label="Yoga" onPress={jest.fn()} isSelected={false} />)
    expect(getByRole('button').props.className).toContain('border-border-strong')
  })

  it('applies opacity-40 when disabled', () => {
    const { getByRole } = render(<Chip label="Yoga" onPress={jest.fn()} isDisabled />)
    expect(getByRole('button').props.className).toContain('opacity-40')
  })
})

describe('Chip — input variant', () => {
  it('renders label', () => {
    const { getByText } = render(<Chip label="React" variant="input" onRemove={jest.fn()} />)
    expect(getByText('React')).toBeTruthy()
  })

  it('shows remove button when onRemove is provided', () => {
    const { getByLabelText } = render(<Chip label="React" variant="input" onRemove={jest.fn()} />)
    expect(getByLabelText('React kaldır')).toBeTruthy()
  })

  it('calls onRemove when × is pressed', () => {
    const onRemove = jest.fn()
    const { getByLabelText } = render(<Chip label="React" variant="input" onRemove={onRemove} />)
    fireEvent.press(getByLabelText('React kaldır'))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onRemove when disabled', () => {
    const onRemove = jest.fn()
    const { getByLabelText } = render(
      <Chip label="React" variant="input" onRemove={onRemove} isDisabled />
    )
    fireEvent.press(getByLabelText('React kaldır'))
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('does not show remove button when onRemove is not provided', () => {
    const { queryByLabelText } = render(<Chip label="React" variant="input" />)
    expect(queryByLabelText('React kaldır')).toBeNull()
  })

  it('applies input styles', () => {
    const { UNSAFE_getByProps } = render(<Chip label="React" variant="input" />)
    const container = UNSAFE_getByProps({ accessibilityRole: 'none' })
    expect(container.props.className).toContain('border-border-strong')
  })
})

describe('Chip — legacy variants map to v2', () => {
  it('renders every variant selected and unselected', () => {
    const variants = ['filter', 'input', 'tag', 'session', 'price', 'onBrand'] as const
    variants.forEach((variant) => {
      const sel = render(<Chip label={variant} variant={variant} isSelected size="md" />)
      expect(sel.getByText(variant).props.className).toContain('font-body-bold')
      sel.unmount()
      const off = render(<Chip label={variant} variant={variant} />)
      expect(off.getByText(variant).props.className).toContain('text-fg')
      off.unmount()
    })
  })
})

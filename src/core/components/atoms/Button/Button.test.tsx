import React from 'react'

import { fireEvent, render } from '@testing-library/react-native'

import { Button } from './Button'

// expo-haptics jest-expo tarafından mock'lanır.

describe('Button', () => {
  it('renders label', () => {
    const { getByText } = render(<Button label="Devam" onPress={jest.fn()} />)
    expect(getByText('Devam')).toBeTruthy()
  })

  it('renders every v2 and legacy variant', () => {
    const variants = [
      'primary',
      'secondary',
      'outline',
      'link',
      'danger',
      'danger-outline',
      'ghost',
      'accent',
      'success',
      'inverse',
    ] as const
    variants.forEach((variant) => {
      const { getByRole, unmount } = render(
        <Button label={variant} onPress={jest.fn()} variant={variant} icon="Plus" />
      )
      expect(getByRole('button')).toBeTruthy()
      unmount()
    })
  })

  it('maps legacy variants onto v2 styles', () => {
    const { getByRole } = render(<Button label="Eski" onPress={jest.fn()} variant="ghost" />)
    expect(getByRole('button').props.className).toContain('border-border-strong')
  })

  it('renders every size (xs falls back to sm)', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    sizes.forEach((size) => {
      const { getByRole, unmount } = render(<Button label={size} onPress={jest.fn()} size={size} />)
      expect(getByRole('button').props.className).toMatch(/h-btn-(sm|md|lg|xl)/)
      unmount()
    })
  })

  it('calls onPress once when tapped', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<Button label="Bas" onPress={onPress} />)
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is disabled with a dashed border and does not fire', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<Button label="Kapalı" onPress={onPress} isDisabled icon="Plus" />)
    const btn = getByRole('button')
    fireEvent.press(btn)
    expect(onPress).not.toHaveBeenCalled()
    expect(btn.props.className).toContain('border-dashed')
    expect(btn.props.accessibilityState).toEqual({ disabled: true, busy: false })
  })

  it('shows a spinner and the loading label while loading', () => {
    const onPress = jest.fn()
    const { getByRole, getByText, getByLabelText } = render(
      <Button label="Gönder" loadingLabel="Gönderiliyor…" onPress={onPress} isLoading />
    )
    expect(getByText('Gönderiliyor…')).toBeTruthy()
    expect(getByLabelText('Yükleniyor')).toBeTruthy()
    fireEvent.press(getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
    expect(getByRole('button').props.accessibilityState).toEqual({ disabled: true, busy: true })
  })

  it('falls back to label when loading without loadingLabel', () => {
    const { getByText } = render(<Button label="Kaydet" onPress={jest.fn()} isLoading />)
    expect(getByText('Kaydet')).toBeTruthy()
  })

  it('renders icon on the right and custom nodes', () => {
    const Left = () => <React.Fragment />
    const { getByText } = render(
      <Button
        label="Sağ"
        onPress={jest.fn()}
        icon="ChevronRight"
        iconPosition="right"
        leftIcon={<Left />}
      />
    )
    expect(getByText('Sağ')).toBeTruthy()
  })

  it('applies w-full when fullWidth', () => {
    const { getByRole } = render(<Button label="Tam" onPress={jest.fn()} fullWidth />)
    expect(getByRole('button').props.className).toContain('w-full')
  })

  it('accepts a fixed width', () => {
    const { getByRole } = render(<Button label="Sabit" onPress={jest.fn()} width={160} />)
    expect(getByRole('button').props.style).toEqual({ width: 160 })
  })

  it('exposes accessibility label and hint', () => {
    const { getByLabelText } = render(
      <Button label="Onayla" onPress={jest.fn()} accessibilityHint="İlan yayına alınır" />
    )
    expect(getByLabelText('Onayla').props.accessibilityHint).toBe('İlan yayına alınır')
  })

  it('fires pressIn / pressOut (press scale) without error', () => {
    const { getByRole } = render(<Button label="Anim" onPress={jest.fn()} />)
    fireEvent(getByRole('button'), 'pressIn')
    fireEvent(getByRole('button'), 'pressOut')
  })
})

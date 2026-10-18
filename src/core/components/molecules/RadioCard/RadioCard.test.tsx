import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { RadioCard } from './RadioCard'

describe('RadioCard', () => {
  it('large variant uses accent fill when selected', () => {
    const { getByRole } = render(
      <RadioCard
        variant="large"
        title="Danışan"
        description="Destek arıyorum"
        mark="D"
        selected
        onPress={jest.fn()}
      />
    )
    const radio = getByRole('radio')
    expect(radio.props.accessibilityState).toEqual({ checked: true, disabled: false })
    expect(radio.props.className).toContain('bg-accent')
    expect(radio.props.accessibilityLabel).toBe('Danışan. Destek arıyorum')
  })

  it('list variant uses accent-soft + accent-line when selected, surface when not', () => {
    const on = render(<RadioCard title="Online" selected onPress={jest.fn()} />)
    expect(on.getByRole('radio').props.className).toContain('border-accent-line')
    on.unmount()
    const off = render(<RadioCard title="Yüz yüze" selected={false} mark="Y" onPress={jest.fn()} />)
    expect(off.getByRole('radio').props.className).toContain('bg-surface')
  })

  it('accepts a custom mark node and fires onPress unless disabled', () => {
    const onPress = jest.fn()
    const { getByRole, getByText, rerender } = render(
      <RadioCard
        title="Test"
        mark={<Text>★</Text>}
        selected={false}
        onPress={onPress}
        variant="large"
      />
    )
    expect(getByText('★')).toBeTruthy()
    fireEvent.press(getByRole('radio'))
    expect(onPress).toHaveBeenCalledTimes(1)
    rerender(<RadioCard title="Test" selected={false} onPress={onPress} isDisabled />)
    fireEvent.press(getByRole('radio'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

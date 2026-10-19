import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('is a labelled button and fires onPress', () => {
    const onPress = jest.fn()
    const { getByRole } = render(
      <IconButton icon="ChevronLeft" accessibilityLabel="Geri" onPress={onPress} />
    )
    const btn = getByRole('button')
    expect(btn.props.accessibilityLabel).toBe('Geri')
    fireEvent.press(btn)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders every variant and size', () => {
    const variants = ['outline', 'ghost', 'primary', 'surface'] as const
    const sizes = ['sm', 'md', 'lg'] as const
    variants.forEach((variant) =>
      sizes.forEach((size) => {
        const { getByRole, unmount } = render(
          <IconButton
            icon="X"
            accessibilityLabel="Kapat"
            onPress={jest.fn()}
            variant={variant}
            size={size}
          />
        )
        expect(getByRole('button')).toBeTruthy()
        unmount()
      })
    )
  })

  it('renders custom children, badge and color', () => {
    const { getByText } = render(
      <IconButton
        accessibilityLabel="Zil"
        onPress={jest.fn()}
        badge={<Text>3</Text>}
        iconColor="#000"
      >
        <Text>zil</Text>
      </IconButton>
    )
    expect(getByText('zil')).toBeTruthy()
    expect(getByText('3')).toBeTruthy()
  })

  it('renders nothing inside when neither icon nor children are given', () => {
    const { getByRole } = render(<IconButton accessibilityLabel="Boş" onPress={jest.fn()} />)
    expect(getByRole('button')).toBeTruthy()
  })

  it('does not fire when disabled', () => {
    const onPress = jest.fn()
    const { getByRole } = render(
      <IconButton icon="X" accessibilityLabel="Kapat" onPress={onPress} isDisabled />
    )
    fireEvent.press(getByRole('button'))
    expect(onPress).not.toHaveBeenCalled()
    expect(getByRole('button').props.accessibilityState).toEqual({ disabled: true })
  })
})

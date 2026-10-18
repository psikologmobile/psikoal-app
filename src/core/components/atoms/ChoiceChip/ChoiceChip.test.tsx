import { fireEvent, render } from '@testing-library/react-native'

import { ChoiceChip } from './ChoiceChip'

describe('ChoiceChip', () => {
  it('is a checkbox that reflects selection', () => {
    const on = render(<ChoiceChip label="Kaygı" selected onPress={jest.fn()} />)
    expect(on.getByRole('checkbox').props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    })
    expect(on.getByRole('checkbox').props.className).toContain('bg-primary')
    on.unmount()
    const off = render(<ChoiceChip label="Kaygı" selected={false} onPress={jest.fn()} />)
    expect(off.getByRole('checkbox').props.className).toContain('border-border-strong')
  })

  it('fires onPress unless disabled', () => {
    const onPress = jest.fn()
    const { getByRole, rerender } = render(
      <ChoiceChip label="Depresyon" selected={false} onPress={onPress} />
    )
    fireEvent.press(getByRole('checkbox'))
    expect(onPress).toHaveBeenCalledTimes(1)
    rerender(<ChoiceChip label="Depresyon" selected={false} onPress={onPress} isDisabled />)
    fireEvent.press(getByRole('checkbox'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

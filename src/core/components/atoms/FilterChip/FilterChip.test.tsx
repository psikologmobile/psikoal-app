import { fireEvent, render } from '@testing-library/react-native'

import { FilterChip } from './FilterChip'

describe('FilterChip', () => {
  it('uses accent fill when selected and outline when not', () => {
    const on = render(<FilterChip label="Yayında" selected onPress={jest.fn()} />)
    expect(on.getByRole('button').props.className).toContain('bg-accent')
    expect(on.getByRole('button').props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    })
    on.unmount()
    const off = render(<FilterChip label="Tümü" selected={false} onPress={jest.fn()} size="sm" />)
    expect(off.getByRole('button').props.className).toContain('border-border-strong')
  })

  it('renders the count in the label and accessibility label', () => {
    const { getByText, getByLabelText } = render(
      <FilterChip label="Yayında" count={2} selected={false} onPress={jest.fn()} />
    )
    expect(getByText('Yayında · 2')).toBeTruthy()
    expect(getByLabelText('Yayında, 2')).toBeTruthy()
  })

  it('fires onPress unless disabled', () => {
    const onPress = jest.fn()
    const { getByRole, rerender } = render(
      <FilterChip label="A" selected={false} onPress={onPress} />
    )
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
    rerender(<FilterChip label="A" selected={false} onPress={onPress} isDisabled />)
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

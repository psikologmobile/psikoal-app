import { fireEvent, render } from '@testing-library/react-native'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('exposes checkbox role with checked state', () => {
    const { getByRole } = render(
      <Checkbox checked accessibilityLabel="Onay" onChange={jest.fn()} />
    )
    const box = getByRole('checkbox')
    expect(box.props.accessibilityState).toEqual({ checked: true, disabled: false })
    expect(box.props.className).toContain('bg-primary')
  })

  it('toggles to the opposite value', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <Checkbox checked={false} accessibilityLabel="Onay" onChange={onChange} />
    )
    fireEvent.press(getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows the error border when unchecked with an error', () => {
    const { getByRole } = render(
      <Checkbox checked={false} hasError accessibilityLabel="Onay" onChange={jest.fn()} />
    )
    expect(getByRole('checkbox').props.className).toContain('border-danger')
  })

  it('does not toggle when disabled', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <Checkbox checked={false} isDisabled accessibilityLabel="Onay" onChange={onChange} />
    )
    fireEvent.press(getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

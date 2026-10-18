import { fireEvent, render } from '@testing-library/react-native'

import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('increments and decrements within bounds', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(
      <Stepper label="Deneyim yılı" value={5} onChange={onChange} min={0} max={10} unit="yıl" />
    )
    fireEvent.press(getByLabelText('Artır'))
    expect(onChange).toHaveBeenLastCalledWith(6)
    fireEvent.press(getByLabelText('Azalt'))
    expect(onChange).toHaveBeenLastCalledWith(4)
  })

  it('disables the decrement button at min and increment at max', () => {
    const onChange = jest.fn()
    const { getByLabelText, rerender } = render(
      <Stepper value={0} onChange={onChange} min={0} max={1} />
    )
    expect(getByLabelText('Azalt').props.accessibilityState).toEqual({ disabled: true })
    rerender(<Stepper value={1} onChange={onChange} min={0} max={1} />)
    expect(getByLabelText('Artır').props.accessibilityState).toEqual({ disabled: true })
  })

  it('supports accessibility increment / decrement actions', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(<Stepper label="Yıl" value={3} onChange={onChange} />)
    const adjustable = getByLabelText('Yıl', { exact: true })
    fireEvent(adjustable, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onChange).toHaveBeenLastCalledWith(4)
    fireEvent(adjustable, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } })
    expect(onChange).toHaveBeenLastCalledWith(2)
  })
})

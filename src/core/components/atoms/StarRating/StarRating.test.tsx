import { fireEvent, render } from '@testing-library/react-native'

import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('renders a radiogroup with one radio per star', () => {
    const { getAllByRole, getByLabelText } = render(<StarRating value={3} onChange={jest.fn()} />)
    expect(getByLabelText('Puan').props.accessibilityRole).toBe('radiogroup')
    const radios = getAllByRole('radio')
    expect(radios).toHaveLength(5)
    expect(radios[2]?.props.accessibilityState).toEqual({ checked: true, disabled: false })
  })

  it('calls onChange with the pressed star', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(<StarRating value={0} onChange={onChange} size="lg" />)
    fireEvent.press(getByLabelText('4 yıldız'))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('does not change when disabled', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(
      <StarRating value={2} onChange={onChange} isDisabled max={3} />
    )
    fireEvent.press(getByLabelText('3 yıldız'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

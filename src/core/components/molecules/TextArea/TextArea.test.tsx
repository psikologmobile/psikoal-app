import { fireEvent, render } from '@testing-library/react-native'

import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('renders a multiline input with a counter', () => {
    const onChangeText = jest.fn()
    const { getByLabelText, getByText } = render(
      <TextArea
        label="Açıklama"
        value="Merhaba"
        onChangeText={onChangeText}
        maxLength={300}
        minLength={20}
      />
    )
    const input = getByLabelText('Açıklama')
    expect(input.props.multiline).toBe(true)
    expect(getByText('7/300').props.className).toContain('text-fg-muted')
    fireEvent.changeText(input, 'yeni')
    expect(onChangeText).toHaveBeenCalledWith('yeni')
  })

  it('highlights the counter once the minimum is reached', () => {
    const { getByText } = render(
      <TextArea
        value="yeterince uzun bir metin"
        onChangeText={jest.fn()}
        maxLength={300}
        minLength={5}
        optional
        label="Not"
      />
    )
    expect(getByText('24/300').props.className).toContain('text-primary-text')
  })

  it('shows error as alert, otherwise hint', () => {
    const { getByText, rerender, queryByText } = render(
      <TextArea value="" onChangeText={jest.fn()} error="En az 20 karakter" hint="ipucu" />
    )
    expect(getByText('En az 20 karakter').props.accessibilityRole).toBe('alert')
    expect(queryByText('ipucu')).toBeNull()
    rerender(<TextArea value="" onChangeText={jest.fn()} hint="ipucu" isDisabled />)
    expect(getByText('ipucu')).toBeTruthy()
  })
})

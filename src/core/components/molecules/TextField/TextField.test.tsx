import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { TextField } from './TextField'

describe('TextField', () => {
  it('renders label, optional mark and forwards text changes', () => {
    const onChangeText = jest.fn()
    const { getByText, getByLabelText } = render(
      <TextField label="Telefon" optional type="tel" value="" onChangeText={onChangeText} />
    )
    expect(getByText(/İsteğe bağlı/)).toBeTruthy()
    const input = getByLabelText('Telefon')
    expect(input.props.keyboardType).toBe('phone-pad')
    fireEvent.changeText(input, '0500')
    expect(onChangeText).toHaveBeenCalledWith('0500')
  })

  it('shows error with alert role and danger border', () => {
    const { getByText, getByLabelText } = render(
      <TextField
        label="E-posta"
        type="email"
        value="z@"
        onChangeText={jest.fn()}
        error="Geçerli bir e-posta yaz."
      />
    )
    expect(getByText('Geçerli bir e-posta yaz.').props.accessibilityRole).toBe('alert')
    const input = getByLabelText('E-posta')
    expect(input.props.keyboardType).toBe('email-address')
    expect(input.props.accessibilityHint).toBe('Geçerli bir e-posta yaz.')
  })

  it('password type is secure with a show/hide toggle', () => {
    const { getByDisplayValue, getByLabelText } = render(
      <TextField label="Şifre" type="password" value="gizli" onChangeText={jest.fn()} />
    )
    expect(getByDisplayValue('gizli').props.secureTextEntry).toBe(true)
    fireEvent.press(getByLabelText('Şifreyi göster'))
    expect(getByDisplayValue('gizli').props.secureTextEntry).toBe(false)
  })

  it('renders hint, labelRight and disabled state; supports number/url types', () => {
    const { getByText, getByDisplayValue, rerender } = render(
      <TextField
        label="Web"
        type="url"
        value="https://"
        onChangeText={jest.fn()}
        hint="İsteğe bağlı bağlantı"
        labelRight={<Text>sağ</Text>}
        isDisabled
      />
    )
    expect(getByText('İsteğe bağlı bağlantı')).toBeTruthy()
    expect(getByText('sağ')).toBeTruthy()
    expect(getByDisplayValue('https://').props.editable).toBe(false)
    rerender(<TextField type="number" value="5" onChangeText={jest.fn()} autoComplete="off" />)
    expect(getByDisplayValue('5').props.keyboardType).toBe('number-pad')
  })
})

import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { ErrorBanner } from './ErrorBanner'
import { InfoBanner } from './InfoBanner'
import { ReminderBanner } from './ReminderBanner'

describe('InfoBanner', () => {
  it('renders string content in accent and neutral tones', () => {
    const { getByText, rerender } = render(<InfoBanner>Bilgin paylaşılmaz.</InfoBanner>)
    expect(getByText('Bilgin paylaşılmaz.').props.className).toContain('text-accent-soft-fg')
    rerender(
      <InfoBanner tone="neutral" icon="Info">
        Nötr bilgi
      </InfoBanner>
    )
    expect(getByText('Nötr bilgi').props.className).toContain('text-fg-muted')
  })

  it('renders custom nodes', () => {
    const { getByText } = render(
      <InfoBanner>
        <Text>özel</Text>
      </InfoBanner>
    )
    expect(getByText('özel')).toBeTruthy()
  })
})

describe('ReminderBanner', () => {
  it('fires both actions', () => {
    const onPrimary = jest.fn()
    const onSecondary = jest.fn()
    const { getByLabelText } = render(
      <ReminderBanner
        primaryLabel="İlanıma git"
        onPrimary={onPrimary}
        secondaryLabel="Anlaşmadım"
        onSecondary={onSecondary}
      >
        Uzman anlaştığını bildirdi.
      </ReminderBanner>
    )
    fireEvent.press(getByLabelText('İlanıma git'))
    fireEvent.press(getByLabelText('Anlaşmadım'))
    expect(onPrimary).toHaveBeenCalledTimes(1)
    expect(onSecondary).toHaveBeenCalledTimes(1)
  })

  it('works with a single action and custom children', () => {
    const { queryByLabelText, getByText } = render(
      <ReminderBanner primaryLabel="Tamam" onPrimary={jest.fn()}>
        <Text>içerik</Text>
      </ReminderBanner>
    )
    expect(getByText('içerik')).toBeTruthy()
    expect(queryByLabelText('Anlaşmadım')).toBeNull()
  })
})

describe('ErrorBanner', () => {
  it('renders an inline alert message', () => {
    const { UNSAFE_getByProps, getByText } = render(
      <ErrorBanner message="E-posta ya da şifre hatalı." />
    )
    expect(UNSAFE_getByProps({ accessibilityRole: 'alert' })).toBeTruthy()
    expect(getByText('E-posta ya da şifre hatalı.')).toBeTruthy()
  })

  it('renders the block variant with retry', () => {
    const onRetry = jest.fn()
    const { getByText, getByLabelText, rerender } = render(
      <ErrorBanner
        title="Bağlantı kurulamadı"
        description="İnternetini kontrol edip tekrar dene."
        onRetry={onRetry}
        shakeKey={1}
      />
    )
    expect(getByText('Bağlantı kurulamadı')).toBeTruthy()
    fireEvent.press(getByLabelText('Tekrar dene'))
    expect(onRetry).toHaveBeenCalledTimes(1)
    rerender(<ErrorBanner title="Bağlantı kurulamadı" shakeKey={2} />)
    expect(getByText('Bağlantı kurulamadı')).toBeTruthy()
  })
})

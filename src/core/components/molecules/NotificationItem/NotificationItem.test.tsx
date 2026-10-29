import { fireEvent, render } from '@testing-library/react-native'

import { NotificationItem } from './NotificationItem'

describe('NotificationItem', () => {
  it('okunmamış satır vurgulu ve erişilebilir etiketli', () => {
    const onPress = jest.fn()
    const { getByRole, getByText } = render(
      <NotificationItem
        title="Yeni teklif"
        body="Murat Aydın teklif verdi."
        time="2 sa önce"
        icon="Send"
        priority="high"
        unread
        onPress={onPress}
      />
    )
    expect(getByText('Yeni teklif')).toBeTruthy()
    const row = getByRole('button')
    expect(row.props.accessibilityLabel).toContain('Okunmadı.')
    fireEvent.press(row)
    expect(onPress).toHaveBeenCalled()
  })

  it.each(['normal', 'low'] as const)('%s öncelik çizilir', (priority) => {
    const { getByText } = render(
      <NotificationItem title="Psikosirius" time="12 Eki" icon="Info" priority={priority} />
    )
    expect(getByText('Psikosirius')).toBeTruthy()
  })
})

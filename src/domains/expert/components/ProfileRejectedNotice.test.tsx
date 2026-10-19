import { fireEvent, render } from '@testing-library/react-native'

import { ProfileRejectedNotice } from './ProfileRejectedNotice'

describe('ProfileRejectedNotice', () => {
  it('gerekçeyi ve güncelleme düğmesini gösterir', () => {
    const onUpdate = jest.fn()
    const view = render(<ProfileRejectedNotice reason="Diploma okunmuyor." onUpdate={onUpdate} />)
    expect(view.getByText(/Diploma okunmuyor./)).toBeTruthy()
    fireEvent.press(view.getByText('Belgelerimi güncelle'))
    expect(onUpdate).toHaveBeenCalled()
  })

  it('gerekçe yoksa yalnız genel metin', () => {
    const view = render(<ProfileRejectedNotice reason={null} />)
    expect(view.queryByText(/Gerekçe/)).toBeNull()
    expect(view.queryByText('Belgelerimi güncelle')).toBeNull()
    expect(view.getByTestId('profile-rejected')).toBeTruthy()
  })
})

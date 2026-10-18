import { render } from '@testing-library/react-native'

import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('is an accessible progressbar', () => {
    const { getByRole } = render(<Spinner />)
    expect(getByRole('progressbar').props.accessibilityLabel).toBe('Yükleniyor')
  })

  it('accepts size, color and label', () => {
    const { getByLabelText, toJSON } = render(
      <Spinner size={24} colorClassName="border-fg" accessibilityLabel="Gönderiliyor" />
    )
    expect(getByLabelText('Gönderiliyor')).toBeTruthy()
    expect(JSON.stringify(toJSON())).toContain('border-fg')
  })
})

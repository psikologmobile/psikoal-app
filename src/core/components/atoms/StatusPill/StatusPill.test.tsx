import { render } from '@testing-library/react-native'

import { StatusPill } from './StatusPill'

describe('StatusPill', () => {
  it('renders every variant with its label', () => {
    const variants = ['live', 'soft', 'matched', 'neutral', 'danger'] as const
    variants.forEach((variant) => {
      const { getByLabelText, unmount } = render(<StatusPill label={variant} variant={variant} />)
      expect(getByLabelText(variant)).toBeTruthy()
      unmount()
    })
  })

  it('live variant uses primary fill', () => {
    const { getByLabelText } = render(<StatusPill label="Yayında" variant="live" />)
    expect(getByLabelText('Yayında').props.className).toContain('bg-primary')
  })

  it('danger variant uses danger border and soft fill', () => {
    const { getByLabelText } = render(<StatusPill label="Reddedildi" variant="danger" />)
    const cls = getByLabelText('Reddedildi').props.className
    expect(cls).toContain('border-danger')
    expect(cls).toContain('bg-danger-soft')
  })

  it('can hide the live dot', () => {
    const { getByText } = render(<StatusPill label="Bekleyen" variant="live" hideDot />)
    expect(getByText('Bekleyen')).toBeTruthy()
  })

  it('soft variant can show a pulsing dot', () => {
    const { getByLabelText } = render(<StatusPill label="Aktif" variant="soft" pulse />)
    const pill = getByLabelText('Aktif')
    expect(pill.props.className).toContain('bg-accent-soft')
    expect(pill.children.length).toBeGreaterThan(1)
  })
})

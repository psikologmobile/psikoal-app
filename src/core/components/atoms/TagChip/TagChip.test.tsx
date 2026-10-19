import { render } from '@testing-library/react-native'

import { TagChip } from './TagChip'

describe('TagChip', () => {
  it('renders each tone with an optional icon', () => {
    const tones = ['bg', 'surface', 'accent'] as const
    tones.forEach((tone) => {
      const { getByText, UNSAFE_getByProps, unmount } = render(
        <TagChip label="Online" tone={tone} icon="Video" />
      )
      expect(getByText('Online')).toBeTruthy()
      expect(UNSAFE_getByProps({ accessibilityRole: 'text' }).props.className).toContain(
        tone === 'accent' ? 'bg-accent-soft' : `bg-${tone}`
      )
      unmount()
    })
  })

  it('renders without icon by default', () => {
    const { getByText } = render(<TagChip label="₺1.500–2.500" />)
    expect(getByText('₺1.500–2.500').props.className).toContain('text-fg')
  })
})

import { fireEvent, render } from '@testing-library/react-native'

import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'online', label: 'Online', icon: 'Video' as const },
  { value: 'yuz', label: 'Yüz yüze' },
  { value: 'ikisi', label: 'İkisi de' },
]

describe('SegmentedControl', () => {
  it('renders a radiogroup and marks the selected option', () => {
    const { getByLabelText, getAllByRole } = render(
      <SegmentedControl
        options={OPTIONS}
        value="yuz"
        onChange={jest.fn()}
        accessibilityLabel="Görüşme şekli"
      />
    )
    expect(getByLabelText('Görüşme şekli').props.accessibilityRole).toBe('radiogroup')
    const radios = getAllByRole('radio')
    expect(radios[1]?.props.accessibilityState).toEqual({ checked: true })
  })

  it('calls onChange only for a different option and lays out the pill', () => {
    const onChange = jest.fn()
    const { getByLabelText, UNSAFE_root } = render(
      <SegmentedControl
        options={OPTIONS}
        value="online"
        onChange={onChange}
        size="lg"
        accessibilityLabel="Şekil"
      />
    )
    fireEvent(getByLabelText('Şekil'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 46 } },
    })
    fireEvent.press(getByLabelText('Online'))
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.press(getByLabelText('İkisi de'))
    expect(onChange).toHaveBeenCalledWith('ikisi')
    expect(UNSAFE_root).toBeTruthy()
  })

  it('accepts legacy `key` options', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(
      <SegmentedControl
        options={[
          { key: 'active', label: 'Aktif' },
          { key: 'past', label: 'Geçmiş' },
        ]}
        value="active"
        onChange={onChange}
      />
    )
    fireEvent.press(getByLabelText('Geçmiş'))
    expect(onChange).toHaveBeenCalledWith('past')
  })
})

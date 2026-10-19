import { fireEvent, render } from '@testing-library/react-native'

import * as Haptics from 'expo-haptics'

import { Switch } from './Switch'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error', Warning: 'warning' },
}))

describe('Switch', () => {
  beforeEach(() => jest.clearAllMocks())

  it('exposes switch role and checked state', () => {
    const { getByRole } = render(
      <Switch value onValueChange={jest.fn()} accessibilityLabel="Yalnız davetler" />
    )
    const sw = getByRole('switch')
    expect(sw.props.accessibilityState).toEqual({ checked: true, disabled: false })
    expect(sw.props.className).toContain('bg-primary')
  })

  it('uses border-strong track when off', () => {
    const { getByRole } = render(<Switch value={false} onValueChange={jest.fn()} />)
    expect(getByRole('switch').props.className).toContain('bg-border-strong')
  })

  it('calls onValueChange with the next value and fires haptics', () => {
    const onValueChange = jest.fn()
    const { getByRole } = render(<Switch value={false} onValueChange={onValueChange} />)
    fireEvent.press(getByRole('switch'))
    expect(onValueChange).toHaveBeenCalledWith(true)
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light')
  })

  it('does not toggle when disabled', () => {
    const onValueChange = jest.fn()
    const { getByRole } = render(<Switch value onValueChange={onValueChange} isDisabled />)
    fireEvent.press(getByRole('switch'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(getByRole('switch').props.accessibilityState.disabled).toBe(true)
  })
})

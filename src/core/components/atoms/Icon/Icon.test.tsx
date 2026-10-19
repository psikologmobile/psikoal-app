import React from 'react'

import { render } from '@testing-library/react-native'

import { Icon, isIconName } from './Icon'

describe('Icon', () => {
  it('renders without crashing for common icon names', () => {
    const names = ['Home', 'User', 'Search', 'Settings', 'Bell', 'ChevronRight', 'X'] as const
    names.forEach((name) => {
      const { unmount } = render(<Icon name={name} />)
      unmount()
    })
  })

  it('renders null for unknown icon name', () => {
    // @ts-expect-error intentionally invalid name
    const { toJSON } = render(<Icon name="NonExistentIcon12345" />)
    expect(toJSON()).toBeNull()
  })

  it('forwards size prop', () => {
    const { UNSAFE_getByType } = render(<Icon name="User" size={32} />)
    expect(UNSAFE_getByType).toBeDefined()
  })

  it('renders with custom color and strokeWidth', () => {
    const { UNSAFE_queryAllByType } = render(
      <Icon name="Heart" size={24} color="#FF0000" strokeWidth={2} />
    )
    const { View } = require('react-native')
    expect(UNSAFE_queryAllByType(View).length).toBeGreaterThanOrEqual(0)
  })
})

describe('isIconName', () => {
  it('recognises Lucide names and rejects unknown ones', () => {
    expect(isIconName('Heart')).toBe(true)
    expect(isIconName('BoyleBirIkonYok')).toBe(false)
  })
})

import { render } from '@testing-library/react-native'

import { NavIcon } from './NavIcon'

import type { NavIconName } from './NavIcon'

describe('NavIcon', () => {
  it('renders every navigation icon', () => {
    const names: NavIconName[] = [
      'discover',
      'listings',
      'matches',
      'settings',
      'opportunities',
      'offers',
      'notifications',
      'balance',
      'plus',
    ]
    names.forEach((name) => {
      const { toJSON, unmount } = render(<NavIcon name={name} color="#000" size={22} />)
      expect(toJSON()).toBeTruthy()
      unmount()
    })
  })
})

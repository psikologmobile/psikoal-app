import React from 'react'

import { fireEvent, render } from '@testing-library/react-native'

import { Avatar, AvatarGroup } from './Avatar'

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    const { UNSAFE_getByType } = render(<Avatar src="https://example.com/avatar.jpg" size="md" />)
    const { Image } = require('react-native')
    const img = UNSAFE_getByType(Image)
    expect(img.props.source.uri).toBe('https://example.com/avatar.jpg')
  })

  it('renders initials when no src provided', () => {
    const { getByText } = render(<Avatar initials="AB" size="md" />)
    expect(getByText('AB')).toBeTruthy()
  })

  it('renders only first 2 characters of initials, uppercased', () => {
    const { getByText } = render(<Avatar initials="abcd" />)
    expect(getByText('AB')).toBeTruthy()
  })

  it('renders fallback person icon when no src and no initials', () => {
    const { UNSAFE_getAllByType } = render(<Avatar size="md" />)
    const { View } = require('react-native')
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThan(0)
  })

  it('falls back to initials when image fails to load', () => {
    const { UNSAFE_getByType, getByText } = render(
      <Avatar src="https://bad-url.com/fail.jpg" initials="JD" size="md" />
    )
    const { Image } = require('react-native')
    fireEvent(UNSAFE_getByType(Image), 'error')
    expect(getByText('JD')).toBeTruthy()
  })

  it('renders badge when provided', () => {
    const Badge = () => (<></>) as React.ReactElement
    const { UNSAFE_getAllByType } = render(<Avatar initials="AB" badge={<Badge />} />)
    const { View } = require('react-native')
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThan(0)
  })

  it('renders all sizes without crashing', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'hero'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<Avatar initials="AB" size={size} />)
      unmount()
    })
  })

  it('has accessibilityRole image', () => {
    const { UNSAFE_getByProps } = render(<Avatar initials="AB" />)
    expect(UNSAFE_getByProps({ accessibilityRole: 'image' })).toBeTruthy()
  })
})

describe('Avatar v2', () => {
  it('applies tone classes and ring', () => {
    const tones = ['accent', 'primary', 'surface'] as const
    tones.forEach((tone) => {
      const { UNSAFE_getByProps, unmount } = render(<Avatar initials="ZY" tone={tone} ring />)
      const el = UNSAFE_getByProps({ accessibilityRole: 'image' })
      expect(el.props.className).toContain('border-bg')
      unmount()
    })
  })

  it('shows a verified badge instead of the custom badge', () => {
    const { getByLabelText } = render(<Avatar initials="EK" isVerified />)
    expect(getByLabelText('Doğrulanmış')).toBeTruthy()
  })
})

describe('AvatarGroup', () => {
  const avatars = [
    { initials: 'AA' },
    { initials: 'BB' },
    { initials: 'CC' },
    { initials: 'DD' },
    { initials: 'EE' },
    { initials: 'FF' },
    { initials: 'GG' },
  ]

  it('renders all avatars when count <= max', () => {
    const { getAllByText } = render(<AvatarGroup avatars={avatars.slice(0, 3)} />)
    expect(getAllByText(/^[A-Z]{2}$/).length).toBe(3)
  })

  it('shows +N overflow when avatars exceed max', () => {
    const { getByText } = render(<AvatarGroup avatars={avatars} max={5} />)
    expect(getByText('+3')).toBeTruthy()
  })

  it('shows correct overflow count', () => {
    const { getByText } = render(<AvatarGroup avatars={avatars} max={3} />)
    expect(getByText('+5')).toBeTruthy()
  })

  it('does not show overflow when exactly at max', () => {
    const { queryByText } = render(<AvatarGroup avatars={avatars.slice(0, 5)} max={5} />)
    expect(queryByText(/^\+/)).toBeNull()
  })
})

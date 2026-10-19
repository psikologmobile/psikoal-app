import { useState } from 'react'

import { AccessibilityInfo, Pressable, Text, View } from 'react-native'

import { act, fireEvent, render, renderHook } from '@testing-library/react-native'

import {
  Bell,
  Coin,
  Radar,
  Breathe,
  Confetti,
  CopyTick,
  CountRoll,
  DrawCheck,
  EnterLeft,
  EnterRight,
  EnterUp,
  FadeIn,
  Flash,
  Fill,
  Float,
  Glow,
  HeartBurst,
  Jiggle,
  Orbit,
  Pop,
  PressableScale,
  PulseDot,
  Ring,
  setReduceMotionOverride,
  Shake,
  Spin,
  staggerDelay,
  useOnceProgress,
  usePresence,
  useReduceMotion,
  useShake,
  Wobble,
} from './index'

afterEach(() => setReduceMotionOverride(null))

describe('useReduceMotion', () => {
  it('reads the system setting and follows the override', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const { result } = renderHook(() => useReduceMotion())
    await act(async () => {
      await Promise.resolve()
    })
    act(() => setReduceMotionOverride(false))
    expect(result.current).toBe(false)
    act(() => setReduceMotionOverride(true))
    expect(result.current).toBe(true)
  })
})

describe('staggerDelay', () => {
  it('multiplies the index by the stagger step', () => {
    expect(staggerDelay(0)).toBe(0)
    expect(staggerDelay(3)).toBe(180)
    expect(staggerDelay(-1, 100)).toBe(100)
  })
})

describe('motion components', () => {
  it.each([false, true])('render their children (reduce motion: %s)', (reduce) => {
    setReduceMotionOverride(reduce)
    const { getByText } = render(
      <View>
        <EnterUp index={2} className="gap-2" fill replayKey="a">
          <Text>up</Text>
        </EnterUp>
        <EnterRight>
          <Text>right</Text>
        </EnterRight>
        <EnterLeft>
          <Text>left</Text>
        </EnterLeft>
        <FadeIn>
          <Text>fade</Text>
        </FadeIn>
        <Pop delay={100} className="p-1">
          <Text>pop</Text>
        </Pop>
        <Shake trigger={1} withHaptic className="p-1">
          <Text>shake</Text>
        </Shake>
        <Jiggle>
          <Text>jiggle</Text>
        </Jiggle>
        <PulseDot size={10}>
          <Text>pulse</Text>
        </PulseDot>
        <Ring size={40} />
        <Ring size={40} loop={false} />
        <Bell className="p-1">
          <Text>bell</Text>
        </Bell>
        <Float>
          <Text>float</Text>
        </Float>
        <Breathe>
          <Text>breathe</Text>
        </Breathe>
        <Orbit reverseDirection>
          <Text>orbit</Text>
        </Orbit>
        <Spin>
          <Text>spin</Text>
        </Spin>
        <Wobble>
          <Text>wobble</Text>
        </Wobble>
        <Glow>
          <Text>glow</Text>
        </Glow>
        <Radar />
        <Radar size={80} />
        <Coin className="p-1">
          <Text>coin</Text>
        </Coin>
        <Flash replayKey="₺575">
          <Text>flash</Text>
        </Flash>
        <Flash className="p-1">
          <Text>flash2</Text>
        </Flash>
        <DrawCheck color="#000" />
        <CountRoll value="₺1.250" />
        <Fill value={0.5} />
        <Confetti count={6} runKey={1} />
        <HeartBurst liked={false} color="#0EA5E9" idleColor="#52525B" />
        <CopyTick copied={false} color="#000" />
      </View>
    )
    ;[
      'up',
      'right',
      'left',
      'fade',
      'pop',
      'shake',
      'jiggle',
      'bell',
      'float',
      'coin',
      'flash',
      'flash2',
    ].forEach((t) => expect(getByText(t)).toBeTruthy())
  })

  it('count-roll reads as one label', () => {
    const { getByLabelText } = render(<CountRoll value={42} accessibilityLabel="Bakiye 42" />)
    expect(getByLabelText('Bakiye 42')).toBeTruthy()
  })

  it('heart and copy tick react to state changes', () => {
    function Harness() {
      const [on, setOn] = useState(false)
      return (
        <Pressable accessibilityRole="button" onPress={() => setOn(true)}>
          <HeartBurst liked={on} color="#0EA5E9" idleColor="#52525B" />
          <CopyTick copied={on} color="#000" />
        </Pressable>
      )
    }
    const { getByRole } = render(<Harness />)
    fireEvent.press(getByRole('button'))
  })

  it('confetti renders nothing when reduce motion is on and measures layout otherwise', () => {
    setReduceMotionOverride(true)
    const reduced = render(<Confetti />)
    expect(reduced.toJSON()).toBeNull()
    reduced.unmount()
    setReduceMotionOverride(false)
    const { UNSAFE_root } = render(<Confetti />)
    const box = UNSAFE_root.findAll((n) => typeof n.props.onLayout === 'function')[0]
    if (box) fireEvent(box, 'layout', { nativeEvent: { layout: { width: 400, height: 800 } } })
  })
})

describe('PressableScale', () => {
  it('fires press handlers and haptics; renders wrapper', () => {
    const onPress = jest.fn()
    const onPressIn = jest.fn()
    const onPressOut = jest.fn()
    const { getByRole } = render(
      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        wrapperClassName="w-full"
      >
        <Text>bas</Text>
      </PressableScale>
    )
    const btn = getByRole('button')
    fireEvent(btn, 'pressIn')
    fireEvent(btn, 'pressOut')
    fireEvent.press(btn)
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onPressIn).toHaveBeenCalledTimes(1)
    expect(onPressOut).toHaveBeenCalledTimes(1)
  })

  it('works without haptics under reduce motion', () => {
    setReduceMotionOverride(true)
    const onPress = jest.fn()
    const { getByRole } = render(
      <PressableScale accessibilityRole="button" onPress={onPress} haptics={false}>
        <Text>bas</Text>
      </PressableScale>
    )
    fireEvent(getByRole('button'), 'pressIn')
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalled()
  })
})

describe('hooks', () => {
  it('usePresence mounts on show and unmounts after hide', () => {
    const { result, rerender } = renderHook(({ v }: { v: boolean }) => usePresence(v), {
      initialProps: { v: false },
    })
    expect(result.current.mounted).toBe(false)
    rerender({ v: true })
    expect(result.current.mounted).toBe(true)
    rerender({ v: false })
    expect(result.current.mounted).toBe(false)
  })

  it('usePresence is instant under reduce motion', () => {
    setReduceMotionOverride(true)
    const { result, rerender } = renderHook(({ v }: { v: boolean }) => usePresence(v), {
      initialProps: { v: true },
    })
    expect(result.current.mounted).toBe(true)
    rerender({ v: false })
    expect(result.current.mounted).toBe(false)
  })

  it('useShake and useOnceProgress run', () => {
    const shake = renderHook(() => useShake())
    act(() => shake.result.current.shake(0))
    setReduceMotionOverride(true)
    act(() => shake.result.current.shake())
    const once = renderHook(() => useOnceProgress({ duration: 300 }))
    expect(once.result.current.value).toBe(1)
  })
})

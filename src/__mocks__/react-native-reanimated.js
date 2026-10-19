const React = require('react')
const { View, Text } = require('react-native')

const Animated = {
  View: View,
  Text: Text,
  Image: View,
  ScrollView: View,
  FlatList: View,
  createAnimatedComponent: (component) => component,
}

module.exports = {
  __esModule: true,
  default: Animated,
  Animated,
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: (fn) => fn(),
  useAnimatedProps: (fn) => fn(),
  // Geri çağırma hemen "bitti" olarak çalışır (usePresence ayrılmayı bekler).
  withTiming: (toValue, _config, callback) => {
    if (typeof callback === 'function') callback(true)
    return toValue
  },
  withSpring: (toValue) => toValue,
  withRepeat: (animation) => animation,
  withSequence: (...animations) => animations[animations.length - 1],
  withDelay: (_delay, animation) => animation,
  interpolate: (_value, _input, output) => output[0],
  interpolateColor: (_value, _input, output) => output[0],
  cancelAnimation: jest.fn(),
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  useReducedMotion: () => false,
  useAnimatedRef: () => ({ current: null }),
  useAnimatedScrollHandler: () => jest.fn(),
  useAnimatedGestureHandler: () => jest.fn(),
  useAnimatedReaction: jest.fn(),
  useDerivedValue: (fn) => ({ value: fn() }),
  FadeIn: { duration: jest.fn().mockReturnThis() },
  FadeOut: { duration: jest.fn().mockReturnThis() },
  SlideInRight: { duration: jest.fn().mockReturnThis() },
  SlideOutLeft: { duration: jest.fn().mockReturnThis() },
  Layout: { duration: jest.fn().mockReturnThis() },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    inOut: (fn) => fn,
    out: (fn) => fn,
    in: (fn) => fn,
    bezier: () => (t) => t,
  },
}

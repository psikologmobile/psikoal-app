import { forwardRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Pressable, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'

import { Icon } from '@/core/components/atoms/Icon'
import { haptic } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled'
export type InputSize = 'sm' | 'md' | 'lg'
/** @deprecated v1 — v2'de tek görünüm vardır */
export type InputTone = 'default' | 'onBrand'

export type InputProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  state?: InputState
  size?: InputSize
  tone?: InputTone
  leftElement?: ReactNode
  rightElement?: ReactNode
  isSecure?: boolean
  multiline?: boolean
  /** Çok satırda en az satır yüksekliği (px). */
  minHeight?: number
  maxLength?: number
  autoCapitalize?: TextInputProps['autoCapitalize']
  autoComplete?: TextInputProps['autoComplete']
  keyboardType?: TextInputProps['keyboardType']
  textContentType?: TextInputProps['textContentType']
  inputMode?: TextInputProps['inputMode']
  returnKeyType?: TextInputProps['returnKeyType']
  autoFocus?: boolean
  /** Temizle (×) düğmesini göster. Varsayılan false. */
  clearable?: boolean
  onFocus?: TextInputProps['onFocus']
  onBlur?: TextInputProps['onBlur']
  onSubmitEditing?: TextInputProps['onSubmitEditing']
  accessibilityLabel?: string
  accessibilityHint?: string
  className?: string
  /**
   * E2E tutamağı. Android'de `resource-id`, iOS'ta `accessibilityIdentifier` olarak
   * dışa vurulur; Maestro akışları bu değere `id:` seçicisiyle bağlanır.
   * Adlandırma sözleşmesi: docs/E2E-TESTID.md
   */
  testID?: string
}

const MULTILINE_MAX_HEIGHT = 180

const containerStateStyles: Record<InputState, string> = {
  default: 'border-border-strong',
  focused: 'border-primary',
  error: 'border-danger',
  success: 'border-border-strong',
  disabled: 'border-dashed border-border-strong opacity-60',
}

// sm 44 · md 52 · lg 56; radius 14–16
const containerSizeStyles: Record<InputSize, string> = {
  sm: 'min-h-11 px-3 rounded-sm',
  md: 'min-h-13 px-3.5 rounded-md',
  lg: 'min-h-14 px-4 rounded-lg',
}

/**
 * Input — tek çerçeveli yazı alanı (atom). surface zemin, 1,5 px border-strong;
 * odakta primary, hatada danger çizgi. Etiket/hata metni için `TextField`.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    value,
    onChangeText,
    placeholder,
    state = 'default',
    size = 'md',
    leftElement,
    rightElement,
    isSecure = false,
    multiline = false,
    minHeight,
    maxLength,
    autoCapitalize,
    autoComplete,
    keyboardType,
    textContentType,
    inputMode,
    onFocus,
    onBlur,
    className,
    autoFocus,
    clearable = false,
    returnKeyType,
    onSubmitEditing,
    accessibilityLabel,
    accessibilityHint,
    testID,
  }: InputProps,
  ref
) {
  const colors = useThemeColors()
  const [isFocused, setIsFocused] = useState(false)
  const [isSecureVisible, setIsSecureVisible] = useState(false)

  const effectiveState: InputState =
    state === 'error' || state === 'disabled' ? state : isFocused ? 'focused' : 'default'
  const isDisabled = state === 'disabled'

  const toggleSecure = () => {
    haptic.light()
    setIsSecureVisible((v) => !v)
  }

  const resolvedRightElement = (() => {
    if (rightElement) return rightElement
    if (isSecure) {
      return (
        <Pressable
          onPress={toggleSecure}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={isSecureVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}
          className="p-1"
        >
          <Icon
            name={isSecureVisible ? 'EyeOff' : 'Eye'}
            size={20}
            color={colors.textMuted}
            strokeWidth={2}
          />
        </Pressable>
      )
    }
    if (clearable && value.length > 0 && !isDisabled && !multiline) {
      return (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Temizle"
          className="p-1"
        >
          <Icon name="X" size={18} color={colors.textMuted} strokeWidth={2.2} />
        </Pressable>
      )
    }
    return null
  })()

  return (
    <View
      className={cn(
        'flex-row items-center border bg-surface',
        containerStateStyles[effectiveState],
        containerSizeStyles[size],
        multiline && 'items-start py-3',
        className
      )}
    >
      {leftElement ? <View className="mr-2">{leftElement}</View> : null}

      <TextInput
        ref={ref}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        editable={!isDisabled}
        secureTextEntry={isSecure && !isSecureVisible}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        textContentType={textContentType}
        inputMode={inputMode}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled }}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        // REASON: çok satırlı alanın yükseklik sınırları prop'tan gelir
        style={
          multiline ? { maxHeight: MULTILINE_MAX_HEIGHT, minHeight: minHeight ?? 96 } : undefined
        }
        className={cn(
          'flex-1 p-0 font-body text-body text-fg',
          size === 'lg' && 'text-base',
          multiline && 'align-top leading-[22px]'
        )}
      />

      {resolvedRightElement ? <View className="ml-2">{resolvedRightElement}</View> : null}
    </View>
  )
})

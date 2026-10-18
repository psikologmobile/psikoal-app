import { forwardRef } from 'react'

import type { TextInput } from 'react-native'
import { View } from 'react-native'

import type { InputProps, InputState } from '@/core/components/atoms'

import { Input, Text } from '@/core/components/atoms'
import { cn } from '@/core/utils/cn'

export type InputFieldProps = Omit<InputProps, 'state' | 'className'> & {
  label?: string
  hint?: string
  errorMessage?: string
  successMessage?: string
  isRequired?: boolean
  isDisabled?: boolean
  className?: string // applied to the outer container
  inputClassName?: string // forwarded to Input
}

/** @deprecated → TextField (type, error, hint, optional). Görünüm v2. */
export const InputField = forwardRef<TextInput, InputFieldProps>(function InputField(
  {
    label,
    hint,
    errorMessage,
    successMessage,
    isRequired = false,
    isDisabled = false,
    className,
    inputClassName,
    ...inputProps
  },
  ref
) {
  const derivedState: InputState = (() => {
    if (isDisabled) return 'disabled'
    if (errorMessage) return 'error'
    if (successMessage) return 'success'
    return 'default'
  })()

  const subText = errorMessage ?? successMessage ?? hint

  return (
    <View className={cn('gap-1.5', className)}>
      {label ? (
        <View className="flex-row items-center gap-0.5">
          <Text className="font-body-bold text-label text-fg">{label}</Text>
          {isRequired ? <Text className="font-body-bold text-label text-danger">*</Text> : null}
        </View>
      ) : null}

      <Input ref={ref} state={derivedState} className={inputClassName} {...inputProps} />

      {subText ? (
        <Text
          accessibilityRole={errorMessage ? 'alert' : undefined}
          className={cn('text-xs', errorMessage ? 'text-danger-soft-fg' : 'text-fg-muted')}
        >
          {subText}
        </Text>
      ) : null}
    </View>
  )
})

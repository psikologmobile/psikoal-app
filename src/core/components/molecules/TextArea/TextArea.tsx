import { View } from 'react-native'

import { Input } from '@/core/components/atoms/Input'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type TextAreaProps = {
  value: string
  onChangeText: (text: string) => void
  label?: string
  optional?: boolean
  placeholder?: string
  /** Karakter sınırı — verilirse "96/300" sayacı gösterilir. */
  maxLength?: number
  /** Sayaç için alt sınır (ör. en az 20 karakter); altındayken sayaç soluk kalır. */
  minLength?: number
  error?: string
  hint?: string
  isDisabled?: boolean
  /** Satır kutusu en az yüksekliği (px), varsayılan 96. */
  minHeight?: number
  containerClassName?: string
  testID?: string
}

/** TextArea — çok satırlı alan + karakter sayacı. İlan açıklaması, not, biyografi, yorum. */
export function TextArea({
  value,
  onChangeText,
  label,
  optional = false,
  placeholder,
  maxLength,
  minLength,
  error,
  hint,
  isDisabled = false,
  minHeight,
  containerClassName,
  testID,
}: TextAreaProps) {
  const count = value.length
  const enough = minLength === undefined || count >= minLength
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="font-body-bold text-label text-fg">
          {label}
          {optional ? (
            <Text className="font-body text-label text-fg-muted"> İsteğe bağlı</Text>
          ) : null}
        </Text>
      ) : null}
      <Input
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline
        minHeight={minHeight}
        state={isDisabled ? 'disabled' : error ? 'error' : 'default'}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
      />
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          {error ? (
            <Text accessibilityRole="alert" className="text-xs text-danger-soft-fg">
              {error}
            </Text>
          ) : hint ? (
            <Text className="text-xs text-fg-muted">{hint}</Text>
          ) : null}
        </View>
        {maxLength ? (
          <Text
            accessibilityLabel={`${count} / ${maxLength} karakter`}
            className={cn(
              'font-body-semibold text-xs',
              enough ? 'text-primary-text' : 'text-fg-muted'
            )}
          >
            {count}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

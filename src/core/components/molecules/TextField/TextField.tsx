import { forwardRef } from 'react'
import type { ReactNode } from 'react'

import { View } from 'react-native'
import type { TextInput, TextInputProps } from 'react-native'

import type { InputProps } from '@/core/components/atoms/Input'

import { Input } from '@/core/components/atoms/Input'
import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type TextFieldType = 'text' | 'email' | 'tel' | 'number' | 'url' | 'password'

export type TextFieldProps = Omit<
  InputProps,
  'state' | 'isSecure' | 'keyboardType' | 'autoComplete' | 'textContentType' | 'inputMode'
> & {
  label?: string
  /** Etiket yanında soluk "İsteğe bağlı" ibaresi. */
  optional?: boolean
  type?: TextFieldType
  /** Hata mesajı — verilirse danger çizgi + alt mesaj + accessibility. */
  error?: string
  /** Yardımcı metin (hata yokken). */
  hint?: string
  isDisabled?: boolean
  /** Etiket satırının sağı (ör. "Şifremi unuttum" bağlantısı). */
  labelRight?: ReactNode
  containerClassName?: string
  autoComplete?: TextInputProps['autoComplete']
}

type TypeConfig = Pick<
  InputProps,
  'keyboardType' | 'autoComplete' | 'textContentType' | 'inputMode' | 'autoCapitalize' | 'isSecure'
>

const TYPE_CONFIG: Record<TextFieldType, TypeConfig> = {
  text: {},
  email: {
    keyboardType: 'email-address',
    autoComplete: 'email',
    textContentType: 'emailAddress',
    inputMode: 'email',
    autoCapitalize: 'none',
  },
  tel: {
    keyboardType: 'phone-pad',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    inputMode: 'tel',
  },
  number: { keyboardType: 'number-pad', inputMode: 'numeric' },
  url: { keyboardType: 'url', textContentType: 'URL', inputMode: 'url', autoCapitalize: 'none' },
  password: {
    isSecure: true,
    autoComplete: 'password',
    textContentType: 'password',
    autoCapitalize: 'none',
  },
}

/**
 * TextField — etiket + Input + hata/ipucu. Tipler: text · email · tel · number ·
 * url · password (göster/gizle). Durumlar: default · focus (primary çizgi) ·
 * error (danger çizgi + alt mesaj) · disabled.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    optional = false,
    type = 'text',
    error,
    hint,
    isDisabled = false,
    labelRight,
    containerClassName,
    autoComplete,
    accessibilityLabel,
    ...inputProps
  },
  ref
) {
  const cfg = TYPE_CONFIG[type]
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <View className="flex-row items-center justify-between">
          <Text className="font-body-bold text-label text-fg">
            {label}
            {optional ? (
              <Text className="font-body text-label text-fg-muted"> İsteğe bağlı</Text>
            ) : null}
          </Text>
          {labelRight}
        </View>
      ) : null}
      <Input
        ref={ref}
        {...cfg}
        {...inputProps}
        autoComplete={autoComplete ?? cfg.autoComplete}
        state={isDisabled ? 'disabled' : error ? 'error' : 'default'}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? hint}
      />
      {error ? (
        <Text accessibilityRole="alert" className="text-xs text-danger-soft-fg">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-xs text-fg-muted">{hint}</Text>
      ) : null}
    </View>
  )
})

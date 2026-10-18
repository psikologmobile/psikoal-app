import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { DrawCheck, haptic } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

/** @deprecated 'onBrand' v1 içindi; v2'de tek görünüm vardır. */
export type CheckboxRowTone = 'default' | 'onBrand'

export type CheckboxRowProps = {
  checked: boolean
  onToggle: () => void
  /** Etiket; içinde bağlantı (iç içe <Text onPress>) olabilir. */
  children: ReactNode
  /** Ekran okuyucu için düz metin etiket. */
  accessibilityLabel: string
  hasError?: boolean
  tone?: CheckboxRowTone
  testID?: string
}

/**
 * CheckboxRow — 28×28 Checkbox görünümü + çok satırlı etiket; satırın tamamı
 * dokunulabilir. Kayıt onayları, iletişim izni, sözleşmeler.
 */
export function CheckboxRow({
  checked,
  onToggle,
  children,
  accessibilityLabel,
  hasError = false,
  testID,
}: CheckboxRowProps) {
  const colors = useThemeColors()
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic.selection()
        onToggle()
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-start gap-3 py-1"
    >
      <View
        className={cn(
          'mt-px h-7 w-7 items-center justify-center rounded-checkbox',
          checked ? 'bg-primary' : 'border border-border-strong bg-surface',
          hasError && !checked && 'border-danger'
        )}
      >
        {checked ? <DrawCheck size={16} color={colors.onPrimary} strokeWidth={3.4} /> : null}
      </View>
      <Text className="flex-1 text-body-sm leading-5 text-fg">{children}</Text>
    </Pressable>
  )
}

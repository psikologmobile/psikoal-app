import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Linking, Pressable, View } from 'react-native'

import * as Clipboard from 'expo-clipboard'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { CopyTick, haptic, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

/** Kopyala → 1,4 sn tik → geri döner. */
function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  const copy = async (key: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text)
      haptic.success()
      setCopiedKey(key)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopiedKey(null), 1400)
    } catch {
      // Panoya yazılamadıysa sessiz geç; satır yine okunabilir.
    }
  }
  return { copiedKey, copy }
}

type RowProps = {
  value: string
  label: string
  copied: boolean
  onCopy: () => void
}

function ContactRow({ value, label, copied, onCopy }: RowProps) {
  const colors = useThemeColors()
  return (
    <View className="flex-row items-center justify-between rounded-md bg-bg py-1 pl-3 pr-1">
      <Text selectable className="flex-1 font-body-semibold text-body text-fg">
        {value}
      </Text>
      <Pressable
        onPress={onCopy}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={copied ? `${label} kopyalandı` : `${label} kopyala`}
        accessibilityLiveRegion="polite"
        className="h-9 w-9 items-center justify-center rounded-inner"
      >
        <CopyTick copied={copied} color={colors.primaryText} />
      </Pressable>
    </View>
  )
}

export type ContactCardProps = {
  phone?: string
  email?: string
  /** Kart başlığı alanı (karşı tarafın avatar + adı). */
  header?: ReactNode
  /** Kartın altına ek içerik. */
  footer?: ReactNode
  className?: string
}

/**
 * ContactCard — telefon/e-posta satırları (kopyala → tik, expo-clipboard),
 * "Ara" (`tel:`) ve "E-posta" (`mailto:`) düğmeleri. accent-soft panel.
 * Teklif sonrası, eşleşme.
 */
export function ContactCard({ phone, email, header, footer, className }: ContactCardProps) {
  const colors = useThemeColors()
  const { copiedKey, copy } = useCopyFeedback()
  const tel = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null

  return (
    <View className={cn('gap-3.5 rounded-panel bg-accent-soft p-5', className)}>
      {header}
      <View className="gap-2">
        {phone ? (
          <ContactRow
            value={phone}
            label="Telefonu"
            copied={copiedKey === 'phone'}
            onCopy={() => void copy('phone', phone)}
          />
        ) : null}
        {email ? (
          <ContactRow
            value={email}
            label="E-postayı"
            copied={copiedKey === 'email'}
            onCopy={() => void copy('email', email)}
          />
        ) : null}
      </View>
      <View className="flex-row gap-2">
        {tel ? (
          <PressableScale
            onPress={() => void Linking.openURL(tel)}
            haptics="medium"
            accessibilityRole="link"
            accessibilityLabel={`Ara: ${phone}`}
            wrapperClassName="flex-1"
            className="h-12 flex-row items-center justify-center gap-1.5 rounded-md bg-primary"
          >
            <Icon name="Phone" size={16} color={colors.onPrimary} strokeWidth={2.2} />
            <Text className="font-body-heavy text-body text-primary-fg">Ara</Text>
          </PressableScale>
        ) : null}
        {email ? (
          <PressableScale
            onPress={() => void Linking.openURL(`mailto:${email}`)}
            accessibilityRole="link"
            accessibilityLabel={`E-posta gönder: ${email}`}
            wrapperClassName="flex-1"
            className="h-12 items-center justify-center rounded-md border border-accent-line"
          >
            <Text className="font-body-bold text-body text-accent-soft-fg">E-posta</Text>
          </PressableScale>
        ) : null}
      </View>
      {footer}
    </View>
  )
}

import type { IconName } from '@/core/components/atoms/Icon'

import { SettingsRow } from '@/core/components/molecules/SettingsRow'

export type MenuRowProps = {
  icon: IconName
  label: string
  onPress: () => void
  value?: string
  danger?: boolean
  hasArrow?: boolean
}

/** @deprecated → SettingsRow (+ SettingsGroup). v2 görünümüne yönlendirilmiş ince sarmalayıcı. */
export function MenuRow({
  icon,
  label,
  onPress,
  value,
  danger = false,
  hasArrow = true,
}: MenuRowProps) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      hint={value}
      danger={danger}
      onPress={onPress}
      right={hasArrow ? undefined : null}
    />
  )
}

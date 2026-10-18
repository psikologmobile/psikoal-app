import type { SelectProps } from '@/core/components/organisms/Select'

import { Select } from '@/core/components/organisms/Select'
import { TURKEY_PROVINCE_NAMES } from '@/core/constants'

export type CityPickerProps = Omit<SelectProps, 'options' | 'searchable' | 'placeholder'> & {
  placeholder?: string
}

/** CityPicker — 81 ilden aranabilir seçim ("İl ara"). Onboarding, İlan oluştur, Ayarlar. */
export function CityPicker({
  label = 'Şehir',
  placeholder = 'Şehir seç',
  ...rest
}: CityPickerProps) {
  return (
    <Select
      {...rest}
      label={label}
      placeholder={placeholder}
      options={TURKEY_PROVINCE_NAMES}
      searchable
      searchPlaceholder="İl ara"
      emptyText="Bu adla bir il yok"
    />
  )
}

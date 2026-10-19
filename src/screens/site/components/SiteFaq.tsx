import { useState } from 'react'

import { View } from 'react-native'

import { AccordionItem } from '@/core/components/molecules/Accordion'
import { cn } from '@/core/utils/cn'

export type SiteFaqItem = { q: string; a: string }

export type SiteFaqProps = {
  items: readonly SiteFaqItem[]
  className?: string
}

/**
 * SSS akordeonu (tasarım: Tanıtım "Merak ettiklerin", Destek): tek seferde bir
 * soru açık, ilki açık başlar; + ikonu 45° döner. Cevaplar statik HTML'de de
 * bulunsun diye açık soru sunucuda da çizilir.
 */
export function SiteFaq({ items, className }: SiteFaqProps) {
  const [open, setOpen] = useState(0)
  return (
    <View className={cn('w-full', className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.q}
          title={item.q}
          open={open === index}
          onToggle={(next) => setOpen(next ? index : -1)}
        >
          {item.a}
        </AccordionItem>
      ))}
    </View>
  )
}

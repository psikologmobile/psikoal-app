import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

/**
 * tailwind-merge, tailwind.config.js'teki özel ölçek adlarını bilmezse
 * `text-body` (yazı boyutu) ile `text-fg` (renk) sınıflarını aynı grupta sanıp
 * birini siler. Özel yazı boyutu ve köşe adları burada tanıtılır.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'hero',
        'h1',
        'h2',
        'h3',
        'sheet',
        'title',
        'number',
        'body-lg',
        'body',
        'body-sm',
        'label',
        'button',
        'badge',
        'overline',
      ],
      radius: ['checkbox', 'inner', 'card', 'panel', 'sheet', 'phone'],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

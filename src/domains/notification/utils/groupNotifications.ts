const DAY_MS = 24 * 60 * 60 * 1000

export type NotificationGroup<T> = { key: 'today' | 'week' | 'older'; label: string; items: T[] }

const LABELS = { today: 'Bugün', week: 'Bu hafta', older: 'Daha önce' } as const

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Bildirimleri "Bugün / Bu hafta / Daha önce" başlıklarına ayırır (b0 ·
 * Bildirimler). Sıra korunur (backend en yeniyi önce verir); boş grup dönmez.
 */
export function groupNotificationsByDay<T extends { createdAt: string }>(
  items: T[],
  now: Date = new Date()
): NotificationGroup<T>[] {
  const today = startOfDay(now)
  const weekStart = today - 6 * DAY_MS
  const buckets: Record<NotificationGroup<T>['key'], T[]> = { today: [], week: [], older: [] }
  for (const item of items) {
    const t = new Date(item.createdAt).getTime()
    if (t >= today) buckets.today.push(item)
    else if (t >= weekStart) buckets.week.push(item)
    else buckets.older.push(item)
  }
  return (['today', 'week', 'older'] as const)
    .filter((k) => buckets[k].length > 0)
    .map((k) => ({ key: k, label: LABELS[k], items: buckets[k] }))
}

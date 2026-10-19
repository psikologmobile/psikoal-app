import { groupNotificationsByDay } from './groupNotifications'

describe('groupNotificationsByDay', () => {
  const now = new Date('2026-10-19T12:00:00+03:00')
  it('bugün / bu hafta / daha önce', () => {
    const items = [
      { id: 'a', createdAt: '2026-10-19T08:00:00+03:00' },
      { id: 'b', createdAt: '2026-10-16T08:00:00+03:00' },
      { id: 'c', createdAt: '2026-10-01T08:00:00+03:00' },
    ]
    const groups = groupNotificationsByDay(items, now)
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ['Bugün', ['a']],
      ['Bu hafta', ['b']],
      ['Daha önce', ['c']],
    ])
  })
  it('boş grup dönmez', () => {
    expect(groupNotificationsByDay([], now)).toEqual([])
  })
})

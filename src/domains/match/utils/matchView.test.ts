import {
  matchTags,
  memberSinceLabel,
  offerPriceLabel,
  sessionLabel,
  toMatchCounterpart,
  yearAblative,
} from './matchView'

import type { Match } from '../types/match.types'

const UUID = '11111111-1111-4111-8111-111111111111'
const match: Match = {
  id: UUID,
  listingId: UUID,
  acceptedOfferId: UUID,
  clientId: UUID,
  expertId: UUID,
  status: 'ACTIVE',
  createdAt: '2026-10-18T10:00:00.000Z',
  client: { id: UUID, fullName: 'Zeynep Yılmaz', email: 'z@o.com', phone: '0500' },
  expert: { id: UUID, name: 'Uzm. Psk. Elif Kaya', title: 'Klinik Psikolog', email: 'e@o.com' },
  listing: {
    id: UUID,
    title: 'Kaygı',
    specialization: ['Kaygı', 'Stres'],
    budgetMin: 2000,
    budgetMax: 3000,
    preferredSessionType: 'online',
    status: 'MATCHED',
    city: 'Konya',
  },
  offer: { id: UUID, price: 2400, sessionType: 'online', status: 'ACCEPTED' },
}

describe('matchView', () => {
  it('danışan uzmanı görür', () => {
    expect(toMatchCounterpart(match, 'client')).toEqual({
      name: 'Uzm. Psk. Elif Kaya',
      initials: 'EK',
      subtitle: 'Klinik Psikolog',
      phone: null,
      email: 'e@o.com',
    })
  })
  it('uzman danışanı görür', () => {
    const c = toMatchCounterpart(match, 'expert')
    expect(c.name).toBe('Zeynep Yılmaz')
    expect(c.initials).toBe('ZY')
    expect(c.subtitle).toBe('Danışan')
    expect(c.phone).toBe('0500')
  })
  it('eksik taraf yedek adlarla', () => {
    const bare = { ...match, expert: null, client: undefined }
    expect(toMatchCounterpart(bare, 'client').name).toBe('Uzman')
    expect(toMatchCounterpart(bare, 'expert').name).toBe('Danışan')
  })
  it('etiketler: alan · ücret · görüşme · tarih', () => {
    expect(matchTags(match, '18 Eki')).toEqual(['Kaygı', '₺2.400', 'Online', '18 Eki'])
    expect(matchTags({ ...match, offer: null, listing: null }, '')).toEqual([])
  })
  it('yardımcılar', () => {
    expect(sessionLabel('yüz_yüze')).toBe('Yüz yüze')
    expect(sessionLabel(null)).toBeNull()
    expect(sessionLabel('x')).toBe('x')
    expect(offerPriceLabel(undefined)).toBeNull()
  })
})

describe('memberSinceLabel', () => {
  it('ay ve yıl ekiyle', () => {
    expect(memberSinceLabel('2026-03-10T10:00:00.000Z')).toBe('Mart 2026’dan beri üye')
    expect(memberSinceLabel('2023-12-10T10:00:00.000Z')).toBe('Aralık 2023’ten beri üye')
    expect(memberSinceLabel('2030-01-10T10:00:00.000Z')).toBe('Ocak 2030’dan beri üye')
    expect(memberSinceLabel(null)).toBeNull()
    expect(memberSinceLabel('bozuk')).toBeNull()
  })
  it('yıl ekleri', () => {
    expect(yearAblative(2021)).toBe('den')
    expect(yearAblative(2020)).toBe('den')
    expect(yearAblative(2040)).toBe('tan')
    expect(yearAblative(2000)).toBe('den')
  })
})

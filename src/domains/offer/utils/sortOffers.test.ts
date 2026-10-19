import { sortOffers } from './sortOffers'

import { makeOffer } from '@/test-utils/fixtures'

const expert = { id: '6b5c2d1e-0f9a-4b8c-8d7e-6f5a4b3c2d1e', name: 'X', title: 'Y', rating: 0 }
const a = makeOffer({
  id: '1d2c3b4a-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  price: 2400,
  createdAt: '2026-10-19T10:00:00Z',
  expert: { ...expert, rating: 4.5 },
})
const b = makeOffer({
  id: '2d2c3b4a-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  price: 1900,
  createdAt: '2026-10-18T10:00:00Z',
  expert: { ...expert, rating: 4.9 },
})
const c = makeOffer({
  id: '3d2c3b4a-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  price: 1900,
  createdAt: '2026-10-19T12:00:00Z',
  expert: null,
})

const ids = (list: ReturnType<typeof sortOffers>) => list.map((o) => o.id[0])

describe('sortOffers', () => {
  it('en yeni', () => expect(ids(sortOffers([a, b, c], 'newest'))).toEqual(['3', '1', '2']))
  it('en düşük ücret (eşitlikte yeni önce)', () =>
    expect(ids(sortOffers([a, b, c], 'fee_asc'))).toEqual(['3', '2', '1']))
  it('en yüksek puan (puansız sona)', () =>
    expect(ids(sortOffers([a, b, c], 'rating_desc'))).toEqual(['2', '1', '3']))
  it('girişi değiştirmez', () => {
    const input = [a, b]
    sortOffers(input, 'fee_asc')
    expect(input[0]).toBe(a)
  })
})

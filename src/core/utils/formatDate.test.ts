import { formatDate } from './formatDate'

describe('formatDate', () => {
  const date = new Date('2024-06-15T00:00:00.000Z')

  it('short format contains year', () => {
    expect(formatDate(date, 'short')).toMatch(/2024/)
  })

  it('long format contains year', () => {
    expect(formatDate(date, 'long')).toMatch(/2024/)
  })

  it('time format contains colon-separated hours and minutes', () => {
    const d = new Date('2024-06-15T14:30:00.000Z')
    expect(formatDate(d, 'time')).toMatch(/\d{1,2}:\d{2}/)
  })

  it('dayMonth format contains day and month name without year', () => {
    const result = formatDate(date, 'dayMonth')
    expect(result).toMatch(/Haziran/)
    expect(result).not.toMatch(/2024/)
  })

  it('dayMonthShort format contains abbreviated month', () => {
    expect(formatDate(date, 'dayMonthShort')).toMatch(/Haz/)
  })

  it('monthYearShort format contains abbreviated month and year', () => {
    expect(formatDate(date, 'monthYearShort')).toMatch(/Haz.*2024/)
  })

  it('accepts a string date', () => {
    expect(formatDate('2024-06-15', 'short')).toMatch(/2024/)
  })

  it('accepts a custom locale', () => {
    const result = formatDate(date, 'short', 'en-US')
    expect(result).toMatch(/2024/)
  })
})

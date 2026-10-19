const TR = 'tr-TR'

const FORMAT_OPTIONS: Record<
  'short' | 'long' | 'time' | 'dayMonth' | 'dayMonthShort' | 'monthYearShort',
  Intl.DateTimeFormatOptions
> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit', hour12: false },
  dayMonth: { day: 'numeric', month: 'long' },
  dayMonthShort: { day: 'numeric', month: 'short' },
  monthYearShort: { month: 'short', year: 'numeric' },
}

export type DateFormat = keyof typeof FORMAT_OPTIONS

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date
}

export function formatDate(date: Date | string, format: DateFormat, locale = TR): string {
  return new Intl.DateTimeFormat(locale, FORMAT_OPTIONS[format]).format(toDate(date))
}

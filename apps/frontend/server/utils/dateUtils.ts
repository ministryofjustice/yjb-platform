import { UTCDate } from '@date-fns/utc'
import { format } from 'date-fns'

function formatDateInUtc(date: Date | string, pattern: string): string {
  const dateInUtc = new UTCDate(date)
  return format(dateInUtc, pattern)
}

export function formatUkDate(date: Date | string): string {
  return formatDateInUtc(date, 'd MMMM yyyy')
}

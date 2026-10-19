import { UTCDate } from '@date-fns/utc'
import { format } from 'date-fns'

// dates are built at midnight UTC, so they're formatted in UTC - otherwise the timezone the
// code runs in could move them to the day before or after
function formatDateInUtc(date: Date | string, pattern: string): string {
  const dateInUtc = new UTCDate(date)
  return format(dateInUtc, pattern)
}

// user facing dates, e.g. 29 June 2026
export function formatUkDate(date: Date | string): string {
  return formatDateInUtc(date, 'd MMMM yyyy')
}

// machine readable dates, e.g. 2026-06-29 - used in the API response and the back link query string
export function toDateString(date: Date | string): string {
  return formatDateInUtc(date, 'yyyy-MM-dd')
}

import { formatUkDate, toDateString } from './dateUtils'

describe('dateUtils', () => {
  const date = new Date(Date.UTC(2026, 5, 9))

  it('toDateString formats as dd/mm/yyyy', () => {
    expect(toDateString(date)).toBe('09/06/2026')
  })

  it('formatUkDate formats as day, month name and year', () => {
    expect(formatUkDate(date)).toBe('9 June 2026')
  })

  it('accepts dates that arrive as strings from the API', () => {
    expect(formatUkDate('2026-06-09')).toBe('9 June 2026')
  })

  it('formats in UTC so the local timezone cannot shift the day', () => {
    const lateEveningUtc = new Date(Date.UTC(2026, 5, 9, 23, 30))

    expect(toDateString(lateEveningUtc)).toBe('09/06/2026')
    expect(formatUkDate(lateEveningUtc)).toBe('9 June 2026')
  })
})

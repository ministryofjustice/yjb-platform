import { formatUkDate, pluralise, toDateString } from '@yjb-platform/shared-types'

// tests for shared date helpers
describe('shared date helpers', () => {
  const date = new Date(Date.UTC(2026, 5, 9))

  it('formatUkDate formats as day, month name and year', () => {
    expect(formatUkDate(date)).toBe('9 June 2026')
  })

  it('toDateString formats as yyyy-mm-dd', () => {
    expect(toDateString(date)).toBe('2026-06-09')
  })

  it('accepts dates that arrive as strings from the API', () => {
    expect(formatUkDate('2026-06-09')).toBe('9 June 2026')
    expect(toDateString('2026-06-09')).toBe('2026-06-09')
  })

  it('formats in UTC so the local timezone cannot shift the day', () => {
    // 23:30 UTC is already the next day in any timezone ahead of UTC (e.g. BST)
    const lateEveningUtc = new Date(Date.UTC(2026, 5, 9, 23, 30))

    expect(formatUkDate(lateEveningUtc)).toBe('9 June 2026')
    expect(toDateString(lateEveningUtc)).toBe('2026-06-09')
  })
})

describe('pluralise', () => {
  it.each([
    [0, '0 days'],
    [1, '1 day'],
    [2, '2 days'],
    [15, '15 days'],
  ])('pluralise(%s, "day") is "%s"', (count: number, expected: string) => {
    expect(pluralise(count, 'day')).toBe(expected)
  })
})

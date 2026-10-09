import { UTCDate } from '@date-fns/utc'
import { buildTermDatesObj } from './dateObjects'

describe('buildTermDatesObj', () => {
  it('adds dayOfWeek and the days from the beginning of the sentence', () => {
    expect(buildTermDatesObj(new Date('2026-12-12'), 167, new Date('2026-06-29'))).toEqual({
      data: new Date('2026-12-12'),
      metadata: {
        dayOfWeek: 'Saturday',
        message: '167 days from the beginning of the sentence (2026-06-29)',
      },
    })
  })

  it('accepts the sentence start as a date string, as it arrives in the request', () => {
    const sentenceStart = '2026-06-29' as unknown as Date

    expect(buildTermDatesObj(new Date('2027-05-28'), 334, sentenceStart).metadata.message).toBe(
      '334 days from the beginning of the sentence (2026-06-29)',
    )
  })

  it('works out dayOfWeek in UTC so the local timezone cannot shift the day', () => {
    // 23:30 UTC on a Sunday is already Monday in any timezone ahead of UTC (e.g. BST)
    const lateSundayUtc = new Date(Date.UTC(2026, 6, 26, 23, 30))

    expect(buildTermDatesObj(lateSundayUtc, 28, new Date('2026-06-29')).metadata.dayOfWeek).toBe('Sunday')
  })

  it('works out dayOfWeek for a UTCDate, as used by the sentence calculator', () => {
    expect(buildTermDatesObj(new UTCDate('2027-05-28'), 334, new UTCDate('2026-06-29')).metadata.dayOfWeek).toBe(
      'Friday',
    )
  })
})

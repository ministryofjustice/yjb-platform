import { UTCDate } from '@date-fns/utc'
import { AppliedAdjustmentStatus, buildfinalDatesObj } from '@yjb-platform/shared-types'

describe('buildfinalDatesObj', () => {
  it('adds dayOfWeek when no adjustments were applied', () => {
    expect(buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28'))).toEqual({
      data: new Date('2027-05-28'),
      metadata: {
        dayOfWeek: 'Friday',
        status: AppliedAdjustmentStatus.not_applied,
        message: ' No adjustments applied',
      },
    })
  })

  it('adds dayOfWeek and the adjustment breakdown when adjustments were applied', () => {
    expect(
      buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
    ).toEqual({
      data: new Date('2027-05-13'),
      metadata: {
        dayOfWeek: 'Thursday',
        status: AppliedAdjustmentStatus.applied,
        message: '2027-05-28 minus 15 days',
      },
    })
  })

  it('adds dayOfWeek when the date was collapsed to the sentence date', () => {
    expect(buildfinalDatesObj(AppliedAdjustmentStatus.collapsed, new Date('2026-06-29'))).toEqual({
      data: new Date('2026-06-29'),
      metadata: {
        dayOfWeek: 'Monday',
        status: AppliedAdjustmentStatus.collapsed,
        message: 'Date was collapsed to sentence date, due to remand/tagged bail bigger then sentence period',
      },
    })
  })

  it('adds dayOfWeek and the unused days when the date was collapsed with unused days', () => {
    expect(
      buildfinalDatesObj(AppliedAdjustmentStatus.collapsedUnused, new Date('2026-06-29'), undefined, undefined, 12),
    ).toEqual({
      data: new Date('2026-06-29'),
      metadata: {
        dayOfWeek: 'Monday',
        status: AppliedAdjustmentStatus.collapsedUnused,
        message: 'Date was collapsed to sentence date, with 12 unused days ',
      },
    })
  })

  it('works out dayOfWeek in UTC so the local timezone cannot shift the day', () => {
    // 23:30 UTC on a Sunday is already Monday in any timezone ahead of UTC (e.g. BST)
    const lateSundayUtc = new Date(Date.UTC(2026, 6, 26, 23, 30))

    expect(buildfinalDatesObj(AppliedAdjustmentStatus.collapsed, lateSundayUtc).metadata.dayOfWeek).toBe('Sunday')
  })

  it('works out dayOfWeek for a UTCDate, as used by the sentence calculator', () => {
    expect(buildfinalDatesObj(AppliedAdjustmentStatus.collapsed, new UTCDate('2026-12-12')).metadata.dayOfWeek).toBe(
      'Saturday',
    )
  })
})

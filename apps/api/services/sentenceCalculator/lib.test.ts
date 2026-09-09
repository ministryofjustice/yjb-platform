import {
  getTotalDaysInTerm,
  increaseDateWithDays,
  getTotalDaysMTD,
  increaseTotalNumRTBDays,
  getETDDate,
  getLTDDate,
} from './lib'
import { InputIndividualSentence } from './types'

describe('getTotalDaysInTerm', () => {
  it('returns 334 days for an 11 month term starting on 2026-06-29', () => {
    const input: InputIndividualSentence = {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    }
    expect(getTotalDaysInTerm(input)).toBe(334)
  })

  it('returns 61 days for a 2 month term starting on 2026-08-24 on shorter months', () => {
    const input: InputIndividualSentence = {
      from: new Date('2026-08-24'),
      durationMonths: 2,
    }
    expect(getTotalDaysInTerm(input)).toBe(61)
  })

  it('returns 62 days for a 2 month term starting on 2026-07-24 on longer months', () => {
    const input: InputIndividualSentence = {
      from: new Date('2026-07-24'),
      durationMonths: 2,
    }
    expect(getTotalDaysInTerm(input)).toBe(62)
  })

  it('counts days in non leap and leap years correctly', () => {
    const nonLeapYearSentence: InputIndividualSentence = {
      from: new Date('2027-02-20'),
      durationMonths: 1,
    }
    expect(getTotalDaysInTerm(nonLeapYearSentence)).toBe(28)

    const leapYearSentence: InputIndividualSentence = {
      from: new Date('2028-02-20'),
      durationMonths: 1,
    }
    expect(getTotalDaysInTerm(leapYearSentence)).toBe(29)
  })

  it('clamps to the last day of a shorter month when a 1 month term starts on the 31st', () => {
    const input: InputIndividualSentence = {
      from: new Date('2027-01-31'),
      durationMonths: 1,
    }
    // Jan 31 + 1 month clamps to Feb 28 (2027 is not a leap year), not Mar 3
    expect(getTotalDaysInTerm(input)).toBe(28)
  })
})

describe('increaseDateWithDays', () => {
  it('returns 2027-05-28 for a 334 days sentence starting 2026-06-29', () => {
    const daysInput = 334
    const from = new Date('2026-06-29')
    expect(increaseDateWithDays(daysInput, from)).toEqual(new Date('2027-05-28'))
  })

  it('returns 2028-05-28 for a 11 month sentence on leap year starting 2027-06-29', () => {
    const input: InputIndividualSentence = {
      from: new Date('2027-06-29'),
      durationMonths: 11,
    }
    const monthsInDays = getTotalDaysInTerm(input)
    expect(increaseDateWithDays(monthsInDays, input.from)).toEqual(new Date('2028-05-28'))
  })

  it('returns 2026-12-12 for a sentence starting 2026-06-29 with an MTD of 167 days', () => {
    const from = new Date('2026-06-29')
    const totalDaysMTD = 167
    expect(increaseDateWithDays(totalDaysMTD, from)).toEqual(new Date('2026-12-12'))
  })

  it('returns 2026-08-16 for a sentence starting 2026-08-01 with an MTD of 16 days', () => {
    const input = {
      from: new Date('2026-08-01'),
      durationMonths: 1,
    }
    const totalDaysMTD: number = getTotalDaysMTD(getTotalDaysInTerm(input))
    expect(increaseDateWithDays(totalDaysMTD, input.from)).toEqual(new Date('2026-08-16'))
  })
})

describe('getTotalDaysMTD', () => {
  it('returns 167 days when the total days in term is 334', () => {
    expect(getTotalDaysMTD(334)).toBe(167)
  })

  it('returns 16 days when total number of days is 31', () => {
    const input: InputIndividualSentence = {
      from: new Date('2026-08-01'),
      durationMonths: 1,
    }
    expect(getTotalDaysMTD(getTotalDaysInTerm(input))).toBe(16)
  })
})

describe('getTotalNumberOfRemandAndTaggedBailDays', () => {
  it('returns 15 if we introduce a 15 days remand only', () => {
    const currentTotal = 0
    expect(increaseTotalNumRTBDays(currentTotal, 15)).toEqual(15)
  })

  it('returns 25 if we introduce a 15 days remand and 10 days tagged bail', () => {
    const currentTotal = 0
    const remandTotal = increaseTotalNumRTBDays(currentTotal, 15)
    const taggedTotal = increaseTotalNumRTBDays(remandTotal, 10)
    expect(taggedTotal).toEqual(25)
  })
})

describe('getETD', () => {
  it('returns 2026-11-12 for a 11 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
    expect(getETDDate(new Date('2026-12-12'), 11)).toEqual(new Date('2026-11-12'))
  })

  it('returns 2026-10-12 for a 19 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
    expect(getETDDate(new Date('2026-12-12'), 19)).toEqual(new Date('2026-10-12'))
  })

  it('returns 0 for a 5 months long sentence, no remand, mtd on 2026-12-12', () => {
    expect(getETDDate(new Date('2026-12-12'), 5)).toEqual(0)
  })
})

describe('getLTD', () => {
  it('returns 2027-01-12 for a 11 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
    expect(getLTDDate(new Date('2026-12-12'), 11)).toEqual(new Date('2027-01-12'))
  })

  it('returns 2027-02-12 for a 19 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
    expect(getLTDDate(new Date('2026-12-12'), 19)).toEqual(new Date('2027-02-12'))
  })

  it('returns 0 for a 5 months long sentence, no remand, mtd on 2026-12-12', () => {
    expect(getLTDDate(new Date('2026-12-12'), 5)).toEqual(0)
  })
})

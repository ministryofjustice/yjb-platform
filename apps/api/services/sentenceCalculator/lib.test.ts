import {
  getTotalDaysInTerm,
  addDaysToDate,
  getTotalDaysMTD,
  increaseTotalNumRTBDays,
  getETDDate,
  getLTDDate,
  adjustCalculation,
} from './lib'
import {
  InputIndividualSentence,
  OutputCalculation,
  AdjustmentTypes,
  RemandAdjustment,
  TaggedBailAdjustment,
  AdjustmentResult,
} from './types'

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

describe('addDaysToDate', () => {
  it('returns 2027-05-28 for a 334 days sentence starting 2026-06-29', () => {
    const daysInput = 334
    const from = new Date('2026-06-29')
    expect(addDaysToDate(daysInput, from)).toEqual(new Date('2027-05-28'))
  })

  it('returns 2028-05-28 for a 11 month sentence on leap year starting 2027-06-29', () => {
    const input: InputIndividualSentence = {
      from: new Date('2027-06-29'),
      durationMonths: 11,
    }
    const monthsInDays = getTotalDaysInTerm(input)
    expect(addDaysToDate(monthsInDays, input.from)).toEqual(new Date('2028-05-28'))
  })

  it('returns 2026-12-12 for a sentence starting 2026-06-29 with an MTD of 167 days', () => {
    const from = new Date('2026-06-29')
    const totalDaysMTD = 167
    expect(addDaysToDate(totalDaysMTD, from)).toEqual(new Date('2026-12-12'))
  })

  it('returns 2026-08-16 for a sentence starting 2026-08-01 with an MTD of 16 days', () => {
    const input = {
      from: new Date('2026-08-01'),
      durationMonths: 1,
    }
    const totalDaysMTD: number = getTotalDaysMTD(getTotalDaysInTerm(input))
    expect(addDaysToDate(totalDaysMTD, input.from)).toEqual(new Date('2026-08-16'))
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

describe('adjustCalculation', () => {
  it('returns an adjustment calculation for 15 days remand, no tagged bail starting on 2026-06-29 11 months', () => {
    const initialOutputCalculation: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }

    const remandAdjustment: RemandAdjustment = {
      name: AdjustmentTypes.remand,
      days: 10,
      startDate: new Date('2026-06-14'),
    }

    const expectedRemandAdjustmentResult: AdjustmentResult = {
      newEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 10,
        sled: new Date('2027-05-18'),
        mtd: new Date('2026-12-02'),
        TUSED: new Date(0),
      },
      newRecordOfAdjustment: {
        adjustmentReason: 'remand',
        adjustmentParameters: remandAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 0,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
          TUSED: new Date(0),
        },
      },
    }

    expect(adjustCalculation(initialOutputCalculation, remandAdjustment)).toEqual(expectedRemandAdjustmentResult)
  })

  it('returns an adjustment calculation for 15 tagged bail, no remand starting on 2026-06-29 11 months', () => {
    const initialOutputCalculation: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }

    const taggedBailAdjustment: TaggedBailAdjustment = {
      name: AdjustmentTypes.taggedBail,
      days: 10,
    }

    const expectedTaggedBailAdjustmentResult: AdjustmentResult = {
      newEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 10,
        sled: new Date('2027-05-18'),
        mtd: new Date('2026-12-02'),
        TUSED: new Date(0),
      },
      newRecordOfAdjustment: {
        adjustmentReason: 'taggedBail',
        adjustmentParameters: taggedBailAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 0,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
          TUSED: new Date(0),
        },
      },
    }

    expect(adjustCalculation(initialOutputCalculation, taggedBailAdjustment)).toEqual(
      expectedTaggedBailAdjustmentResult,
    )
  })

  it('it correctly applies a tagged bail adjustment to a calculation already adjusted by remand', () => {
    const initialOutputCalculation: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }

    const remandAdjustment: RemandAdjustment = {
      name: AdjustmentTypes.remand,
      days: 10,
      startDate: new Date('2026-06-14'),
    }

    const taggedBailAdjustment: TaggedBailAdjustment = {
      name: AdjustmentTypes.taggedBail,
      days: 5,
    }

    const finalAdjustmentResult: AdjustmentResult = {
      newEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: new Date('2027-05-13'),
        mtd: new Date('2026-11-27'),
        TUSED: new Date(0),
      },
      newRecordOfAdjustment: {
        adjustmentReason: 'taggedBail',
        adjustmentParameters: taggedBailAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 10,
          sled: new Date('2027-05-18'),
          mtd: new Date('2026-12-02'),
          TUSED: new Date(0),
        },
      },
    }

    // get the adjustmented Effective Date calcs for remand
    const resultRemandAdjustment: AdjustmentResult = adjustCalculation(initialOutputCalculation, remandAdjustment)

    // apply new Effective Dates past adjustments record to a copy of initial calc obj (preserve obj for clear debugging)
    const adjustedCalulationObject = initialOutputCalculation
    adjustedCalulationObject.effectiveDates = resultRemandAdjustment.newEffectiveDates
    adjustedCalulationObject.effectiveDatesPastAdjustments.push(resultRemandAdjustment.newRecordOfAdjustment)

    // get the adjustmented Effective Date calcs for tagged bail
    expect(adjustCalculation(adjustedCalulationObject, taggedBailAdjustment)).toEqual(finalAdjustmentResult)
  })

  it('it correctly applies a remand adjustment to a calculation already adjusted by tagged bail', () => {
    const initialOutputCalculation: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }

    const remandAdjustment: RemandAdjustment = {
      name: AdjustmentTypes.remand,
      days: 10,
      startDate: new Date('2026-06-14'),
    }

    const taggedBailAdjustment: TaggedBailAdjustment = {
      name: AdjustmentTypes.taggedBail,
      days: 5,
    }

    const finalAdjustmentResult: AdjustmentResult = {
      newEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: new Date('2027-05-13'),
        mtd: new Date('2026-11-27'),
        TUSED: new Date(0),
      },
      newRecordOfAdjustment: {
        adjustmentReason: 'remand',
        adjustmentParameters: remandAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 5,
          sled: new Date('2027-05-23'),
          mtd: new Date('2026-12-07'),
          TUSED: new Date(0),
        },
      },
    }

    // get the adjustmented Effective Date calcs for remand
    const resultTaggedBailAdjustment: AdjustmentResult = adjustCalculation(
      initialOutputCalculation,
      taggedBailAdjustment,
    )

    // apply new Effective Dates past adjustments record to a copy of initial calc obj (preserve obj for clear debugging)
    const adjustedCalulationObject = initialOutputCalculation
    adjustedCalulationObject.effectiveDates = resultTaggedBailAdjustment.newEffectiveDates
    adjustedCalulationObject.effectiveDatesPastAdjustments.push(resultTaggedBailAdjustment.newRecordOfAdjustment)

    // get the adjustmented Effective Date calcs for tagged bail
    expect(adjustCalculation(adjustedCalulationObject, remandAdjustment)).toEqual(finalAdjustmentResult)
  })
})

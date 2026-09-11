import {
  getTotalDaysInTerm,
  addDaysToDate,
  getTotalDaysMTD,
  increaseTotalNumRTBDays,
  getETDDate,
  getLTDDate,
  adjustCalculation,
  getSledDate,
  getMTDDate,
  calculateTerm,
} from './lib'
import {
  InputIndividualSentence,
  OutputCalculation,
  AdjustmentTypes,
  RemandAdjustment,
  TaggedBailAdjustment,
  AdjustmentResult,
  CalculatedTerm,
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

describe('getSledDate', () => {
  it('returns 2027-05-28 for 334 days sentence starting on 2026-06-29', () => {
    expect(getSledDate(334, new Date('2026-06-29'))).toEqual(new Date('2027-05-28'))
  })

  it('returns 2026-10-23 for a 61 days term starting on 2026-08-24 on shorter months', () => {
    expect(getSledDate(61, new Date('2026-08-24'))).toEqual(new Date('2026-10-23'))
  })

  it('returns 2026-09-23 for a 62 days term starting on 2026-07-24 on longer months', () => {
    expect(getSledDate(62, new Date('2026-07-24'))).toEqual(new Date('2026-09-23'))
  })

  it('returns 2027-03-19 for a 28 days term starting on 2027-02-20 in a non leap year', () => {
    expect(getSledDate(28, new Date('2027-02-20'))).toEqual(new Date('2027-03-19'))
  })

  it('returns 2028-03-19 for a 29 days term starting on 2028-02-20 in a leap year', () => {
    expect(getSledDate(29, new Date('2028-02-20'))).toEqual(new Date('2028-03-19'))
  })

  it('returns 2027-02-27 for a 28 days term starting on 2027-01-31 clamped to the shorter month', () => {
    expect(getSledDate(28, new Date('2027-01-31'))).toEqual(new Date('2027-02-27'))
  })

  it('returns 2028-05-28 for a 335 days term starting on 2027-06-29 on leap year', () => {
    expect(getSledDate(335, new Date('2027-06-29'))).toEqual(new Date('2028-05-28'))
  })
})

describe('getMTDDate', () => {
  it('returns 2026-12-12 for 167 total mtd days sentence starting on 2026-06-29', () => {
    expect(getMTDDate(167, new Date('2026-06-29'))).toEqual(new Date('2026-12-12'))
  })

  it('returns 2026-09-23 for 31 total mtd days starting on 2026-08-24 on shorter months', () => {
    expect(getMTDDate(31, new Date('2026-08-24'))).toEqual(new Date('2026-09-23'))
  })

  it('returns 2026-08-23 for 31 total mtd days starting on 2026-07-24 on longer months', () => {
    expect(getMTDDate(31, new Date('2026-07-24'))).toEqual(new Date('2026-08-23'))
  })

  it('returns 2027-03-05 for 14 total mtd days starting on 2027-02-20 in a non leap year', () => {
    expect(getMTDDate(14, new Date('2027-02-20'))).toEqual(new Date('2027-03-05'))
  })

  it('returns 2028-03-05 for 15 total mtd days starting on 2028-02-20 in a leap year', () => {
    expect(getMTDDate(15, new Date('2028-02-20'))).toEqual(new Date('2028-03-05'))
  })

  it('returns 2027-02-13 for 14 total mtd days starting on 2027-01-31 clamped to the shorter month', () => {
    expect(getMTDDate(14, new Date('2027-01-31'))).toEqual(new Date('2027-02-13'))
  })

  it('returns 2026-08-16 for 16 total mtd days starting on 2026-08-01', () => {
    expect(getMTDDate(16, new Date('2026-08-01'))).toEqual(new Date('2026-08-16'))
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

describe('calculateTerm', () => {
  it('returns term with sled 2027-05-28 and mtd 2026-12-12 for 11 months sentence starting on 2026-06-29', () => {
    const inputSentence: InputIndividualSentence = {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    }

    const expectedTermOutput: CalculatedTerm = {
      inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
      totalDaysInTerm: 334,
      totalDaysMTD: 167,
      sled: new Date('2027-05-28'),
      mtd: new Date('2026-12-12'),
    }

    expect(calculateTerm(inputSentence)).toEqual(expectedTermOutput)
  })

  it('returns term with sled 2026-10-23 and mtd 2026-09-23 for a 2 month term starting on 2026-08-24 on shorter months', () => {
    const inputSentence: InputIndividualSentence = {
      from: new Date('2026-08-24'),
      durationMonths: 2,
    }

    const expectedTermOutput: CalculatedTerm = {
      inputSentence: { from: new Date('2026-08-24'), durationMonths: 2 },
      totalDaysInTerm: 61,
      totalDaysMTD: 31,
      sled: new Date('2026-10-23'),
      mtd: new Date('2026-09-23'),
    }

    expect(calculateTerm(inputSentence)).toEqual(expectedTermOutput)
  })

  it('returns term with sled 2028-03-19 and mtd 2028-03-05 for a 1 month term starting on 2028-02-20 in a leap year', () => {
    const inputSentence: InputIndividualSentence = {
      from: new Date('2028-02-20'),
      durationMonths: 1,
    }

    const expectedTermOutput: CalculatedTerm = {
      inputSentence: { from: new Date('2028-02-20'), durationMonths: 1 },
      totalDaysInTerm: 29,
      totalDaysMTD: 15,
      sled: new Date('2028-03-19'),
      mtd: new Date('2028-03-05'),
    }

    expect(calculateTerm(inputSentence)).toEqual(expectedTermOutput)
  })

  it('returns term with sled 2027-02-27 and mtd 2027-02-13 for a 1 month term starting on 2027-01-31 clamped to the shorter month', () => {
    const inputSentence: InputIndividualSentence = {
      from: new Date('2027-01-31'),
      durationMonths: 1,
    }

    const expectedTermOutput: CalculatedTerm = {
      inputSentence: { from: new Date('2027-01-31'), durationMonths: 1 },
      totalDaysInTerm: 28,
      totalDaysMTD: 14,
      sled: new Date('2027-02-27'),
      mtd: new Date('2027-02-13'),
    }

    expect(calculateTerm(inputSentence)).toEqual(expectedTermOutput)
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

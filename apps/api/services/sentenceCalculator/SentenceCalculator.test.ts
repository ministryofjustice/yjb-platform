import SentenceCalculator from './SentenceCalculator'
import {InputSentences, AdjustmentTypes, OutputCalculation} from './types'
import {addDays} from "date-fns";

const defaultSentence: InputSentences = {
  offenderName: 'Test Offender',
  remandAdjustment: {
    name: AdjustmentTypes.remand,
    days: 0,
    startDate: new Date(),
  },
  inputIndividualSentences: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    },
  ],
}

describe('SentenceCalculator', () => {
  let defaultCalculator: SentenceCalculator

  beforeEach(() => {
    defaultCalculator = new SentenceCalculator(defaultSentence)
  })

  describe('getTotalDaysInTerm', () => {
    it('returns 334 days for an 11 month term starting on 2026-06-29', () => {
      expect(defaultCalculator.getTotalDaysInTerm()).toBe(334)
    })

    it('returns 61 days for a 2 month term starting on 2026-08-24', () => {
      const dummySentence1: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2026-08-24'),
            durationMonths: 2,
          },
        ],
      }
      const calculator1 = new SentenceCalculator(dummySentence1)
      expect(calculator1.getTotalDaysInTerm()).toBe(61)
    })

    it('returns 62 days for a 2 month term starting on 2026-07-24', () => {
      const dummySentence2: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2026-07-24'),
            durationMonths: 2,
          },
        ],
      }
      const calculator2 = new SentenceCalculator(dummySentence2)
      expect(calculator2.getTotalDaysInTerm()).toBe(62)
    })

    it('counts days in leap years correctly', () => {
      const sentenceNotInLeapYear: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2027-02-20'),
            durationMonths: 1,
          },
        ],
      }
      const calculatorNotInLeapYear = new SentenceCalculator(sentenceNotInLeapYear)
      expect(calculatorNotInLeapYear.getTotalDaysInTerm()).toBe(28)

      const sentenceInLeapYear: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2028-02-20'),
            durationMonths: 1,
          },
        ],
      }

      const calculatorInLeapYear = new SentenceCalculator(sentenceInLeapYear)
      expect(calculatorInLeapYear.getTotalDaysInTerm()).toBe(29)
    })
    it('clamps to the last day of a shorter month when a 1 month term starts on the 31st', () => {
      const sentenceMonthEnd: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2027-01-31'),
            durationMonths: 1,
          },
        ],
      }
      const calculatorMonthEnd = new SentenceCalculator(sentenceMonthEnd)
      // Jan 31 + 1 month clamps to Feb 28 (2027 is not a leap year), not Mar 3
      expect(calculatorMonthEnd.getTotalDaysInTerm()).toBe(28)
    })
  })

  describe('getSledDate', () => {
    it('returns 2027-05-28 for a 11 month sentence starting 2026-06-29', () => {
      const totalDaysInTerm: number = defaultCalculator.getTotalDaysInTerm()
      expect(defaultCalculator.getSledDate(totalDaysInTerm)).toEqual(new Date('2027-05-28'))
    })

    it('returns 2028-05-28 for a 11 month sentence on leap year starting 2027-06-29', () => {
      const dummySentence1: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2027-06-29'),
            durationMonths: 11,
          },
        ],
      }
      const calculator1 = new SentenceCalculator(dummySentence1)
      const totalDaysInTerm: number = calculator1.getTotalDaysInTerm()
      expect(calculator1.getSledDate(totalDaysInTerm)).toEqual(new Date('2028-05-28'))
    })
  })

  describe('getTotalDaysMTD', () => {
    it('returns 167 days when the total days in term is 334', () => {
      expect(defaultCalculator.getTotalDaysMTD()).toBe(167)
    })

    it('returns 16 days when total number of days is 31', () => {
      const sentenceToRound: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
          },
        ],
      }
      const calculatorToRound = new SentenceCalculator(sentenceToRound)
      expect(calculatorToRound.getTotalDaysMTD()).toBe(16)
    })
  })

  describe('getMTDDate', () => {
    it('returns 2026-12-12 for a sentence starting 2026-06-29 with an MTD of 167 days', () => {
      const totalDaysMTD: number = defaultCalculator.getTotalDaysMTD()
      expect(defaultCalculator.getMTDDate(totalDaysMTD)).toEqual(new Date('2026-12-12'))
    })

    it('returns 2026-08-16 for a sentence starting 2026-08-01 with an MTD of 16 days', () => {
      const sentenceToRound: InputSentences = {
        offenderName: 'Test Offender',
        inputIndividualSentences: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
          },
        ],
      }
      const calculatorToRound = new SentenceCalculator(sentenceToRound)
      const totalDaysMTD: number = calculatorToRound.getTotalDaysMTD()
      expect(calculatorToRound.getMTDDate(totalDaysMTD)).toEqual(new Date('2026-08-16'))
    })
  })

  describe('getTotalNumberOfRemandAndTaggedBailDays', () => {
    it('returns 15 if we introduce a 15 days remand only', () => {
      const currentTotal = defaultCalculator.getCalculation().effectiveDates.totalNumberOfRemandAndTaggedBailDays
      expect(defaultCalculator.increaseTotalNumRTBDays(currentTotal, 15)).toEqual(15)
    })

    it('returns 25 if we introduce a 15 days remand and 10 days tagged bail', () => {
      const currentTotal = defaultCalculator.getCalculation().effectiveDates.totalNumberOfRemandAndTaggedBailDays
      const remandTotal = defaultCalculator.increaseTotalNumRTBDays(currentTotal, 15)
      const taggedTotal = defaultCalculator.increaseTotalNumRTBDays(remandTotal, 10)
      expect(taggedTotal).toEqual(25)
    })
  })

  describe('getETD', () => {
    // only testing no remand scenario here, remand scenarios with adjustment covered in adjustment testing
    it('returns 2026-11-12 for a 11 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
      expect(defaultCalculator.getETDDate(new Date('2026-12-12'), 334)).toEqual(new Date('2026-11-12'))
    })
  })

  describe('getLTD', () => {
    // only testing no remand scenario here, remand scenarios with adjustment covered in adjustment testing
    it('returns 2027-01-12 for a 11 months long sentence, NO REMAND, mtd on 2026-12-12', () => {
      expect(defaultCalculator.getLTDDate(new Date('2026-12-12'), 334)).toEqual(new Date('2027-01-12'))
    })
  })

  describe('applyTaggedBail', () => {
    it('returns an adjustment record with the sled and mtd dates prior to the adjustment and appends it to the calculation ', () => {
      const record = defaultCalculator.applyTaggedBail(15, AdjustmentTypes.taggedBail)
      expect(record).toEqual({
        adjustmentReason: 'taggedBail',
        adjustmentParameters: defaultSentence.taggedBailAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 0,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
          TUSED: new Date(0),
        },
      })
    })

    it('adds a new adjustment record each time it is called', () => {
      defaultCalculator.applyTaggedBail(10, AdjustmentTypes.taggedBail)
      defaultCalculator.applyTaggedBail(5, AdjustmentTypes.taggedBail)

      const calcResult = defaultCalculator.getCalculation()

      expect(calcResult.effectiveDatesPastAdjustments).toHaveLength(2)
    })

    it('subtracts the remand days from sled and mtd', () => {
      defaultCalculator.applyTaggedBail(13, AdjustmentTypes.taggedBail)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2027-05-15'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-11-29'))
    })

    it('clamps sled and mtd to the sentence start date when remand covers the whole sentence', () => {
      defaultCalculator.applyTaggedBail(334, AdjustmentTypes.taggedBail)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })

    it('clamps sled and mtd to the sentence start date when remand exceeds the sentence length', () => {
      defaultCalculator.applyTaggedBail(400, AdjustmentTypes.taggedBail)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })
  })

  describe('applyRemand', () => {
    it('returns an adjustment record with the sled and mtd dates prior to the adjustment', () => {
      const record = defaultCalculator.applyRemand(15, AdjustmentTypes.remand)
      expect(record).toEqual({
        adjustmentReason: 'remand',
        adjustmentParameters: defaultSentence.remandAdjustment,
        pastEffectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 0,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
          TUSED: new Date(0),
        },
      })
    })

    it('subtracts the remand days from sled and mtd', () => {
      defaultCalculator.applyRemand(15, AdjustmentTypes.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2027-05-13'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-11-27'))
    })

    it('adds a new adjustment record each time it is called', () => {
      defaultCalculator.applyRemand(10, AdjustmentTypes.remand)
      defaultCalculator.applyRemand(5, AdjustmentTypes.remand)
      const {
        effectiveDatesPastAdjustments,
        effectiveDates: { sled: sledDate, mtd: mtdDate },
      } = defaultCalculator.getCalculation()
      expect(effectiveDatesPastAdjustments).toHaveLength(2)
      expect(sledDate).toEqual(new Date('2027-05-13'))
      expect(mtdDate).toEqual(new Date('2026-11-27'))
    })

    it('clamps sled and mtd to the sentence start date when remand covers the whole sentence', () => {
      defaultCalculator.applyRemand(334, AdjustmentTypes.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })

    it('clamps sled and mtd to the sentence start date when remand exceeds the sentence length', () => {
      defaultCalculator.applyRemand(400, AdjustmentTypes.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })
  })

  describe('adjustCalculation', () => {
    const exampleRemandSentence: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 15,
        startDate: new Date('2026-06-14'),
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }

    it('does not change the calculatedTerms object', () => {
      const calculatorRemand = new SentenceCalculator(exampleRemandSentence)

      const unadjustedResult = calculatorRemand.getCalculation()
      const adjustedResult = calculatorRemand.adjustCalculation(AdjustmentTypes.remand)
      expect(unadjustedResult.calculatedTerms).toEqual(adjustedResult.calculatedTerms)
    })

    it('adds an effectiveDatesPastAdjustment to the result object', () => {
      const calculatorRemand = new SentenceCalculator(exampleRemandSentence)

      const adjustedResult = calculatorRemand.adjustCalculation(AdjustmentTypes.remand)
      expect(adjustedResult.effectiveDatesPastAdjustments.length).toEqual(1)
    })

    it('changes the effective dates when an adjustment is applied', () => {
      const calculatorRemand = new SentenceCalculator(exampleRemandSentence)
      const remandDays: number = exampleRemandSentence.remandAdjustment!.days

      const adjustedResult = calculatorRemand.adjustCalculation(AdjustmentTypes.remand)

      expect(addDays(adjustedResult.effectiveDates.sled,remandDays)).toEqual(adjustedResult.calculatedTerms[0].sled)
      expect(addDays(adjustedResult.effectiveDates.mtd,remandDays)).toEqual(adjustedResult.calculatedTerms[0].mtd)
    })

    // TODO: test around returning references by value. Swapping the order of const unadjustedResult and const adjustedResult SHOULD break things (I think!)
    // it('has the same result as getCalculation', () => {
    //   const calculatorRemand = new SentenceCalculator(exampleRemandSentence)
    //
    //   const unadjustedResult = calculatorRemand.getCalculation()
    //   const adjustedResult = calculatorRemand.adjustCalculation(AdjustmentTypes.remand)
    //
    //   expect(adjustedResult).toEqual(unadjustedResult)
    // })

    it('returns the full calculation for a single-term sentence, no remand', () => {
      expect(defaultCalculator.adjustCalculation(AdjustmentTypes.remand)).toEqual({
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
      })
    })

    it('returns the full calculation for a single-term sentence,  15 days remand', () => {
      const calculatorRemand = new SentenceCalculator(exampleRemandSentence)

      expect(calculatorRemand.adjustCalculation(AdjustmentTypes.remand)).toEqual({
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
          totalNumberOfRemandAndTaggedBailDays: 15,
          sled: new Date('2027-05-13'),
          mtd: new Date('2026-11-27'),
          TUSED: new Date(0),
        },
        ltd: new Date('2026-12-27'),
        etd: new Date('2026-10-27'),
        effectiveDatesPastAdjustments: [
          {
            adjustmentReason: 'remand',
            adjustmentParameters: exampleRemandSentence.remandAdjustment,
            pastEffectiveDates: {
              totalNumberOfRemandAndTaggedBailDays: 0,
              sled: new Date('2027-05-28'),
              mtd: new Date('2026-12-12'),
              TUSED: new Date(0),
            },
          },
        ],
      })
    })

    it('returns the full calculation for a single-term sentence, 4 days tagged bail', () => {
      const sentenceWithTaggedBail: InputSentences = {
        offenderName: 'Test Offender',
        taggedBailAdjustment: {
          name: AdjustmentTypes.taggedBail,
          days: 4,
        },
        inputIndividualSentences: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
          },
        ],
      }
      const calculator = new SentenceCalculator(sentenceWithTaggedBail)

      const result: OutputCalculation = calculator.adjustCalculation(AdjustmentTypes.taggedBail)

      expect(result).toEqual({
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
          totalNumberOfRemandAndTaggedBailDays: 4,
          sled: new Date('2027-05-24'),
          mtd: new Date('2026-12-08'),
          TUSED: new Date(0),
        },
        ltd: new Date('2027-01-08'),
        etd: new Date('2026-11-08'),
        effectiveDatesPastAdjustments: [
          {
            adjustmentReason: 'taggedBail',
            adjustmentParameters: sentenceWithTaggedBail.taggedBailAdjustment,
            pastEffectiveDates: {
              totalNumberOfRemandAndTaggedBailDays: 0,
              sled: new Date('2027-05-28'),
              mtd: new Date('2026-12-12'),
              TUSED: new Date(0),
            },
          },
        ],
      })
    })

    it('returns the full calculation for a single-term sentence,  15 days remand and 4 days tagged bail', () => {
      const sentenceWithRemandAndTaggedBail: InputSentences = {
        offenderName: 'Test Offender',
        remandAdjustment: {
          name: AdjustmentTypes.remand,
          days: 15,
          startDate: new Date('2026-06-14'),
        },
        taggedBailAdjustment: {
          name: AdjustmentTypes.taggedBail,
          days: 4,
        },
        inputIndividualSentences: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
          },
        ],
      }
      const calculatorRemand = new SentenceCalculator(sentenceWithRemandAndTaggedBail)
      calculatorRemand.adjustCalculation(AdjustmentTypes.remand)
      const result = calculatorRemand.adjustCalculation(AdjustmentTypes.taggedBail)
      expect(result).toEqual({
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
          totalNumberOfRemandAndTaggedBailDays: 19,
          sled: new Date('2027-05-09'),
          mtd: new Date('2026-11-23'),
          TUSED: new Date(0),
        },
        ltd: new Date('2026-12-23'),
        etd: new Date('2026-10-23'),
        effectiveDatesPastAdjustments: [
          {
            adjustmentReason: 'remand',
            adjustmentParameters: sentenceWithRemandAndTaggedBail.remandAdjustment,
            pastEffectiveDates: {
              totalNumberOfRemandAndTaggedBailDays: 0,
              sled: new Date('2027-05-28'),
              mtd: new Date('2026-12-12'),
              TUSED: new Date(0),
            },
          },
          {
            adjustmentReason: 'taggedBail',
            adjustmentParameters: sentenceWithRemandAndTaggedBail.taggedBailAdjustment,
            pastEffectiveDates: {
              totalNumberOfRemandAndTaggedBailDays: 15,
              sled: new Date('2027-05-13'),
              mtd: new Date('2026-11-27'),
              TUSED: new Date(0),
            },
          },
        ],
      })
    })



    it('returns the same dates regardless of the order in which remand and tagged bail are applied', () => {
      const sentenceWithRemandAndTaggedBail: InputSentences = {
        offenderName: 'Test Offender',
        remandAdjustment: {
          name: AdjustmentTypes.remand,
          days: 15,
          startDate: new Date('2026-06-14'),
        },
        taggedBailAdjustment: {
          name: AdjustmentTypes.taggedBail,
          days: 4,
        },
        inputIndividualSentences: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
          },
        ],
      }
      const calculatorRemandFirst = new SentenceCalculator(sentenceWithRemandAndTaggedBail)
      calculatorRemandFirst.adjustCalculation(AdjustmentTypes.remand)
      const resultRemandFirst = calculatorRemandFirst.adjustCalculation(AdjustmentTypes.taggedBail)

      const calculatorTaggedBailFirstFirst = new SentenceCalculator(sentenceWithRemandAndTaggedBail)
      calculatorTaggedBailFirstFirst.adjustCalculation(AdjustmentTypes.taggedBail)
      const resultTaggedBailFirst = calculatorTaggedBailFirstFirst.adjustCalculation(AdjustmentTypes.remand)

      expect(resultRemandFirst.calculatedTerms).toEqual(resultTaggedBailFirst.calculatedTerms)
      expect(resultRemandFirst.effectiveDates).toEqual(resultTaggedBailFirst.effectiveDates)
      expect(resultRemandFirst.ltd).toEqual(resultTaggedBailFirst.ltd)
      expect(resultRemandFirst.etd).toEqual(resultTaggedBailFirst.etd)
    })

    it('returns the expected past adjustments in the correct order', () => {
      const sentenceWithRemandAndTaggedBail: InputSentences = {
        offenderName: 'Test Offender',
        remandAdjustment: {
          name: AdjustmentTypes.remand,
          days: 15,
          startDate: new Date('2026-06-14'),
        },
        taggedBailAdjustment: {
          name: AdjustmentTypes.taggedBail,
          days: 4,
        },
        inputIndividualSentences: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
          },
        ],
      }
      const calculatorRemandFirst = new SentenceCalculator(sentenceWithRemandAndTaggedBail)
      calculatorRemandFirst.adjustCalculation(AdjustmentTypes.remand)
      const resultRemandFirst = calculatorRemandFirst.adjustCalculation(AdjustmentTypes.taggedBail)

      const calculatorTaggedBailFirstFirst = new SentenceCalculator(sentenceWithRemandAndTaggedBail)
      calculatorTaggedBailFirstFirst.adjustCalculation(AdjustmentTypes.taggedBail)
      const resultTaggedBailFirst = calculatorTaggedBailFirstFirst.adjustCalculation(AdjustmentTypes.remand)

      expect(resultRemandFirst.effectiveDatesPastAdjustments[0].adjustmentReason).toEqual('remand')
      expect(resultRemandFirst.effectiveDatesPastAdjustments[0].pastEffectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
      expect(resultRemandFirst.effectiveDatesPastAdjustments[1].pastEffectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(15)

      expect(resultTaggedBailFirst.effectiveDatesPastAdjustments[0].adjustmentReason).toEqual('taggedBail')
      expect(resultTaggedBailFirst.effectiveDatesPastAdjustments[0].pastEffectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
      expect(resultTaggedBailFirst.effectiveDatesPastAdjustments[1].pastEffectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(4)
    })

    it('returns the full calculation for a single-term sentence,  30 days remand on leap', () => {
      const sentenceRemand: InputSentences = {
        offenderName: 'Test Offender',
        remandAdjustment: {
          name: AdjustmentTypes.remand,
          days: 30,
          startDate: new Date('2027-01-02'),
        },
        inputIndividualSentences: [
          {
            from: new Date('2027-02-01'),
            durationMonths: 2,
          },
        ],
      }
      const calculatorRemand = new SentenceCalculator(sentenceRemand)
      expect(calculatorRemand.adjustCalculation(AdjustmentTypes.remand)).toEqual({
        calculatedTerms: [
          {
            inputSentence: { from: new Date('2027-02-01'), durationMonths: 2 },
            totalDaysInTerm: 59,
            totalDaysMTD: 30,
            sled: new Date('2027-03-31'),
            mtd: new Date('2027-03-02'),
          },
        ],
        effectiveDates: {
          totalNumberOfRemandAndTaggedBailDays: 30,
          sled: new Date('2027-03-01'),
          mtd: new Date('2027-01-31'),
          TUSED: new Date(0),
        },
        ltd: new Date('2027-02-28'),
        etd: new Date('2026-12-31'),
        effectiveDatesPastAdjustments: [
          {
            adjustmentReason: 'remand',
            adjustmentParameters: sentenceRemand.remandAdjustment,
            pastEffectiveDates: {
              totalNumberOfRemandAndTaggedBailDays: 0,
              sled: new Date('2027-03-31'),
              mtd: new Date('2027-03-02'),
              TUSED: new Date(0),
            },
          },
        ],
      })
    })
  })
})

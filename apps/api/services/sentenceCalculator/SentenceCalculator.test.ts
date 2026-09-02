import SentenceCalculator from './SentenceCalculator'
import { InputSentences, AdjustmentTypes } from './types'

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
      const sentenceRemand: InputSentences = {
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
      const calculatorRemand = new SentenceCalculator(sentenceRemand)
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
          totalNumberOfRemandAndTaggedBailDays: 0,
          sled: new Date('2027-05-13'),
          mtd: new Date('2026-11-27'),
          TUSED: new Date(0),
        },
        ltd: new Date('2026-12-27'),
        etd: new Date('2026-10-27'),
        effectiveDatesPastAdjustments: [
          {
            adjustmentReason: 'remand',
            adjustmentParameters: sentenceRemand.remandAdjustment,
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
          totalNumberOfRemandAndTaggedBailDays: 0,
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

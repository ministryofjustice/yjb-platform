import SentenceCalculator from './SentenceCalculator'
import { Sentence, Reason } from './types'

const defaultSentence: Sentence = {
  offenderName: 'Test Offender',
  term: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
      remand: 0,
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
      const dummySentence1: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2026-08-24'),
            durationMonths: 2,
            remand: 0,
          },
        ],
      }
      const calculator1 = new SentenceCalculator(dummySentence1)
      expect(calculator1.getTotalDaysInTerm()).toBe(61)
    })

    it('returns 62 days for a 2 month term starting on 2026-07-24', () => {
      const dummySentence2: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2026-07-24'),
            durationMonths: 2,
            remand: 0,
          },
        ],
      }
      const calculator2 = new SentenceCalculator(dummySentence2)
      expect(calculator2.getTotalDaysInTerm()).toBe(62)
    })

    it('counts days in leap years correctly', () => {
      const sentenceNotInLeapYear: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2027-02-20'),
            durationMonths: 1,
            remand: 0,
          },
        ],
      }
      const calculatorNotInLeapYear = new SentenceCalculator(sentenceNotInLeapYear)
      expect(calculatorNotInLeapYear.getTotalDaysInTerm()).toBe(28)

      const sentenceInLeapYear: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2028-02-20'),
            durationMonths: 1,
            remand: 0,
          },
        ],
      }

      const calculatorInLeapYear = new SentenceCalculator(sentenceInLeapYear)
      expect(calculatorInLeapYear.getTotalDaysInTerm()).toBe(29)
    })
    it('clamps to the last day of a shorter month when a 1 month term starts on the 31st', () => {
      const sentenceMonthEnd: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2027-01-31'),
            durationMonths: 1,
            remand: 0,
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
      const dummySentence1: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2027-06-29'),
            durationMonths: 11,
            remand: 0,
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
      const sentenceToRound: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
            remand: 0,
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
      const sentenceToRound: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
            remand: 0,
          },
        ],
      }
      const calculatorToRound = new SentenceCalculator(sentenceToRound)
      const totalDaysMTD: number = calculatorToRound.getTotalDaysMTD()
      expect(calculatorToRound.getMTDDate(totalDaysMTD)).toEqual(new Date('2026-08-16'))
    })
  })

  describe('applyRemand', () => {
    it('returns an adjustment record with the sled and mtd dates prior to the adjustment', () => {
      const record = defaultCalculator.applyRemand(15, Reason.remand)
      expect(record).toEqual({
        type: 'remand',
        sledDate: new Date('2027-05-28'),
        mtdDate: new Date('2026-12-12'),
      })
    })

    it('subtracts the remand days from sled and mtd', () => {
      defaultCalculator.applyRemand(15, Reason.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2027-05-13'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-11-27'))
    })

    it('adds a new adjustment record each time it is called', () => {
      defaultCalculator.applyRemand(10, Reason.remand)
      defaultCalculator.applyRemand(5, Reason.remand)
      const {
        adjustmentRecords,
        effectiveDates: { sled: sledDate, mtd: mtdDate },
      } = defaultCalculator.getCalculation()
      expect(adjustmentRecords).toHaveLength(2)
      expect(sledDate).toEqual(new Date('2027-05-13'))
      expect(mtdDate).toEqual(new Date('2026-11-27'))
    })

    it('clamps sled and mtd to the sentence start date when remand covers the whole sentence', () => {
      defaultCalculator.applyRemand(334, Reason.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })

    it('clamps sled and mtd to the sentence start date when remand exceeds the sentence length', () => {
      defaultCalculator.applyRemand(400, Reason.remand)
      expect(defaultCalculator.getCalculation().effectiveDates.sled).toEqual(new Date('2026-06-29'))
      expect(defaultCalculator.getCalculation().effectiveDates.mtd).toEqual(new Date('2026-06-29'))
    })
  })

  describe('adjustCalculation', () => {
    it('returns the full calculation for a single-term sentence', () => {
      expect(defaultCalculator.adjustCalculation(Reason.remand)).toEqual({
        totalDaysInTerm: 334,
        totalDaysMTD: 167,
        effectiveDates: {
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
          // ETD/LTD placeholder
          ltd: expect.any(Date),
          etd: expect.any(Date),
        },
        adjustmentRecords: [],
      })
    })

    it('returns the full calculation with 15 days remand', () => {
      const sentenceRemand: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
            remand: 15,
          },
        ],
      }
      const calculatorRemand = new SentenceCalculator(sentenceRemand)
      expect(calculatorRemand.adjustCalculation(Reason.remand)).toEqual({
        totalDaysInTerm: 334,
        totalDaysMTD: 167,
        effectiveDates: {
          sled: new Date('2027-05-13'),
          mtd: new Date('2026-11-27'),
          // ETD/LTD placeholder
          ltd: expect.any(Date),
          etd: expect.any(Date),
        },
        adjustmentRecords: [{ type: 'remand', sledDate: new Date('2027-05-28'), mtdDate: new Date('2026-12-12') }],
      })
    })

    it('returns the full calculation with 15 days remand on leap', () => {
      const sentenceRemand: Sentence = {
        offenderName: 'Test Offender',
        term: [
          {
            from: new Date('2027-02-01'),
            durationMonths: 2,
            remand: 30,
          },
        ],
      }
      const calculatorRemand = new SentenceCalculator(sentenceRemand)
      expect(calculatorRemand.adjustCalculation(Reason.remand)).toEqual({
        totalDaysInTerm: 59,
        totalDaysMTD: 30,
        effectiveDates: {
          sled: new Date('2027-03-01'),
          mtd: new Date('2027-01-31'),
          // ETD/LTD placeholder
          ltd: expect.any(Date),
          etd: expect.any(Date),
        },
        adjustmentRecords: [{ type: 'remand', sledDate: new Date('2027-03-31'), mtdDate: new Date('2027-03-02') }],
      })
    })
  })
})

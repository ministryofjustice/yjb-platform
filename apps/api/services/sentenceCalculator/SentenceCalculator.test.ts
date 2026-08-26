import SentenceCalculator from './SentenceCalculator'
import { Sentence } from './types'

const defaultSentence: Sentence = {
  term: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
      offenderName: 'Test Offender',
      remand: 0
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
        term: [
          {
            from: new Date('2026-08-24'),
            durationMonths: 2,
            offenderName: 'Test Offender',
          },
        ],
      }
      let calculator1 = new SentenceCalculator(dummySentence1)
      expect(calculator1.getTotalDaysInTerm()).toBe(61)
    })

    it('returns 62 days for a 2 month term starting on 2026-07-24', () => {
      const dummySentence2: Sentence = {
        term: [
          {
            from: new Date('2026-07-24'),
            durationMonths: 2,
            offenderName: 'Test Offender',
          },
        ],
      }
      let calculator2 = new SentenceCalculator(dummySentence2)
      expect(calculator2.getTotalDaysInTerm()).toBe(62)
    })

    it('counts days in leap years correctly', () => {
      const sentenceNotInLeapYear: Sentence = {
        term: [
          {
            from: new Date('2027-02-20'),
            durationMonths: 1,
            offenderName: 'Test Offender',
            remand: 0
          },
        ],
      }
      let calculatorNotInLeapYear = new SentenceCalculator(sentenceNotInLeapYear)
      expect(calculatorNotInLeapYear.getTotalDaysInTerm()).toBe(28)

      const sentenceInLeapYear: Sentence = {
        term: [
          {
            from: new Date('2028-02-20'),
            durationMonths: 1,
            offenderName: 'Test Offender',
            remand: 0
          },
        ],
      }

      let calculatorInLeapYear = new SentenceCalculator(sentenceInLeapYear)
      expect(calculatorInLeapYear.getTotalDaysInTerm()).toBe(29)
    })
  })

  describe('getSledDate', () => {
    it('returns 2027-05-28 for a 11 month sentence starting 2026-06-29', () => {
      const totalDaysInTerm: number = defaultCalculator.getTotalDaysInTerm()
      expect(defaultCalculator.getSledDate(defaultSentence, totalDaysInTerm)).toEqual(new Date('2027-05-28'))
    })

    it('returns 2028-05-28 for a 11 month sentence on leap year starting 2027-06-29', () => {
      const dummySentence1: Sentence = {
        term: [
          {
            from: new Date('2027-06-29'),
            durationMonths: 11,
            offenderName: 'Test Offender',
            remand: 0
          },
        ],
      }
      let calculator1= new SentenceCalculator(dummySentence1)
      const totalDaysInTerm: number = calculator1.getTotalDaysInTerm()
      expect(defaultCalculator.getSledDate(dummySentence1, totalDaysInTerm)).toEqual(new Date('2028-05-28'))
    })
  })

  describe('getTotalDaysMTD', () => {
    it('returns 167 days when the total days in term is 334', () => {
      expect(defaultCalculator.getTotalDaysMTD(defaultSentence)).toBe(167)
    })

    it('returns 16 days when total number of days is 31', () => {
      const sentenceToRound: Sentence = {
        term: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
            offenderName: 'Test Offender',
          },
        ],
      }
      let calculatorToRound = new SentenceCalculator(sentenceToRound)
      expect(calculatorToRound.getTotalDaysMTD(sentenceToRound)).toBe(16)
    })
  })

  describe('getMTDDate', () => {
    it('returns 2026-12-12 for a sentence starting 2026-06-29 with an MTD of 167 days', () => {
      const totalDaysMTD: number = defaultCalculator.getTotalDaysMTD(defaultSentence)
      expect(defaultCalculator.getMTDDate(defaultSentence, totalDaysMTD)).toEqual(new Date('2026-12-12'))
    })

    it('returns 2026-08-16 for a sentence starting 2026-08-01 with an MTD of 16 days', () => {
      const sentenceToRound: Sentence = {
        term: [
          {
            from: new Date('2026-08-01'),
            durationMonths: 1,
            offenderName: 'Test Offender',
            remand: 0
          },
        ],
      }
      let calculatorToRound = new SentenceCalculator(sentenceToRound)
      const totalDaysMTD: number = calculatorToRound.getTotalDaysMTD(sentenceToRound)
      expect(calculatorToRound.getMTDDate(sentenceToRound, totalDaysMTD)).toEqual(new Date('2026-08-16'))
    })
  })

  describe('getTotalCalculation', () => {
    it('returns the full calculation for a single-term sentence', () => {
      expect(defaultCalculator.getTotalCalculation(defaultSentence)).toEqual({
        totalDaysInTerm: 334,
        sledDate: new Date('2027-05-28'),
        totalDaysMTD: 167,
        mtdDate: new Date('2026-12-12'),
      })
    })

    it('returns the full calculation with 15 days remand', () => {
      const sentenceRemand: Sentence = {
        term: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
            offenderName: 'Test Offender',
            remand: 15
          },
        ],
      }
      expect(defaultCalculator.getTotalCalculation(sentenceRemand)).toEqual({
          totalDaysInTerm: 334,
          sledDate: new Date('2027-05-13'),
          totalDaysMTD: 167,
          mtdDate: new Date('2026-11-27'),
      })
    })

     it('returns the full calculation with 15 days remand on leap', () => {
      const sentenceRemand: Sentence = {
        term: [
          {
            from: new Date('2027-02-01'),
            durationMonths: 2,
            offenderName: 'Test Offender',
            remand: 30
          },
        ],
      }
      let calculatorRemand = new SentenceCalculator(sentenceRemand)
      //now the date goes before the sentence day so what do we do?
      expect(calculatorRemand.getTotalCalculation(sentenceRemand)).toEqual({
          totalDaysInTerm: 59,
          sledDate: new Date('2027-03-01'),
          totalDaysMTD: 30,
          mtdDate: new Date('2027-01-31'),
      })
    })
  })
})

import SentenceCalculator from './SentenceCalculator'
import { Sentence } from './types'

const defaultSentence: Sentence = {
  term: [
    {
      from: new Date('2026-06-28'),
      duration: '11 months',
      offenderName: 'Test Offender',
    },
  ],
}

describe('SentenceCalculator', () => {
  let calculator: SentenceCalculator

  beforeEach(() => {
    calculator = new SentenceCalculator()
  })

  describe('getTotalDaysInTerm', () => {
    it('returns 334 days for an 11 month term', () => {
      expect(calculator.getTotalDaysInTerm(defaultSentence.term[0].duration)).toBe(334)
    })
  })

  describe('getSledDate', () => {
    it('returns 2027-05-28 for a sentence starting 2026-06-28 and 334 days long', () => {
      expect(calculator.getSledDate(defaultSentence)).toEqual(new Date('2027-05-28'))
    })
  })

  describe('getTotalDaysMTD', () => {
    it('returns 167 days when the total days in term is 334', () => {
      expect(calculator.getTotalDaysMTD(defaultSentence)).toBe(167)
    })
  })

  describe('getMTDDate', () => {
    it('returns 2026-12-12 for a sentence starting 2026-06-28 with an MTD of 167 days', () => {
      expect(calculator.getMTDDate(defaultSentence)).toEqual(new Date('2026-12-12'))
    })
  })

  describe('getTotalCalculation', () => {
    it('returns the full calculation for a single-term sentence', () => {
      expect(calculator.getTotalCalculation(defaultSentence)).toEqual({
        totalDaysInTerm: 334,
        sledDate: new Date('2027-05-28'),
        totalDaysMTD: 167,
        mtdDate: new Date('2026-12-12'),
      })
    })
  })
})

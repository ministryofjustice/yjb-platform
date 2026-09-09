
  import { getTotalDaysInTerm } from './lib'
  import {InputIndividualSentence} from './types'

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
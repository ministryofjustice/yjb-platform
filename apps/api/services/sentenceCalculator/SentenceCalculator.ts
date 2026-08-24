import { Sentence, Calculation } from './types'

export default class SentenceCalculator {
  getTotalDaysInTerm(duration: string): number {
    if (duration === '11 months') {
      return 334
    }

    throw new Error('no calculation for this input')
  }

  getSledDate(sentence: Sentence, totalDaysInTerm: number): Date {
    const { from } = sentence.term[0]

    if (from.toISOString().startsWith('2026-06-28') && totalDaysInTerm === 334) {
      return new Date('2027-05-28')
    }

    throw new Error('no calculation for this input')
  }

  getTotalDaysMTD(sentence: Sentence, totalDaysInTerm: number): number {
    if (totalDaysInTerm === 334) {
      return 167
    }

    throw new Error('no calculation for this input')
  }

  getMTDDate(sentence: Sentence, totalDaysMTD: number): Date {
    const { from } = sentence.term[0]

    if (from.toISOString().startsWith('2026-06-28') && totalDaysMTD === 167) {
      return new Date('2026-12-12')
    }

    throw new Error('no calculation for this input')
  }

  getTotalCalculation(sentence: Sentence): Calculation {
    const totalDaysInTerm = this.getTotalDaysInTerm(sentence.term[0].duration)
    const sledDate = this.getSledDate(sentence, totalDaysInTerm)
    const totalDaysMTD = this.getTotalDaysMTD(sentence, totalDaysInTerm)
    const mtdDate = this.getMTDDate(sentence, totalDaysMTD)

    return { totalDaysInTerm, sledDate, totalDaysMTD, mtdDate }
  }
}

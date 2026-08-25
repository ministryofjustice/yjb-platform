import { addMonths, addDays, differenceInCalendarDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { Sentence, Calculation } from './types'

export default class SentenceCalculator {
  getTotalDaysInTerm(sentence: Sentence): number {
    const { from, durationMonths } = sentence.term[0]
    const to = addMonths(new UTCDate(from), durationMonths)

    return differenceInCalendarDays(to, from)
  }

  getSledDate(sentence: Sentence, totalDaysInTerm:number): Date {
    const { from } = sentence.term[0];
    //add term starting from the sentence day 
    return addDays(new UTCDate(from), totalDaysInTerm - 1);
  }

  getTotalDaysMTD(sentence: Sentence): number {
    const totalDaysInTerm: number = this.getTotalDaysInTerm(sentence)
    return Math.round(totalDaysInTerm / 2);
  }

 getMTDDate(sentence: Sentence): Date {
    const { from } = sentence.term[0]
    const totalDaysMTD: number = this.getTotalDaysMTD(sentence)

    // add mtd starting from the sentence day
    return addDays(new UTCDate(from), totalDaysMTD - 1)
  }

  getTotalCalculation(sentence: Sentence): Calculation {
    const totalDaysInTerm = this.getTotalDaysInTerm(sentence)
    const sledDate = this.getSledDate(sentence, totalDaysInTerm)
    const totalDaysMTD = this.getTotalDaysMTD(sentence)
    const mtdDate = this.getMTDDate(sentence)

    return { totalDaysInTerm, sledDate, totalDaysMTD, mtdDate }
  }
}

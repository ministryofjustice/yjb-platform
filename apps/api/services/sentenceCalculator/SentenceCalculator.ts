import { addMonths, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { Sentence, Calculation } from './types'

export default class SentenceCalculator {
  getTotalDaysInTerm(sentence: Sentence): number {
    const { from, durationMonths } = sentence.term[0]
    const utcFrom = new UTCDate(from)
    const to = addMonths(utcFrom, durationMonths)

    return differenceInCalendarDays(to, utcFrom)
  }

  getSledDate(sentence: Sentence, totalDaysInTerm: number): Date {
    const { from } = sentence.term[0]
    // add term starting from the sentence day
    return addDays(new UTCDate(from), totalDaysInTerm - 1)
  }

  getTotalDaysMTD(sentence: Sentence): number {
    const totalDaysInTerm: number = this.getTotalDaysInTerm(sentence)
    return Math.round(totalDaysInTerm / 2)
  }

  getMTDDate(sentence: Sentence, totalDaysMTD: number): Date {
    const { from } = sentence.term[0]

    // add mtd starting from the sentence day
    return addDays(new UTCDate(from), totalDaysMTD - 1)
  }

  applyRemand(sledDate: Date, mtdDate: Date, remand: number): Date[] {
      let newSledDate = new Date
      let newMTDDate = new Date
      newSledDate = subDays(sledDate, remand )
      newMTDDate = subDays(mtdDate, remand )

      return [newSledDate, newMTDDate]
  }

  getTotalCalculation(sentence: Sentence): Calculation {
    const totalDaysInTerm = this.getTotalDaysInTerm(sentence)
    let sledDate = this.getSledDate(sentence, totalDaysInTerm)
    const totalDaysMTD = this.getTotalDaysMTD(sentence)
    let mtdDate = this.getMTDDate(sentence, totalDaysMTD)
    const {remand} = sentence.term[0]

    if(remand > 0){
        let adjustedDates = this.applyRemand(sledDate, mtdDate, remand);
        sledDate = adjustedDates[0]
        mtdDate = adjustedDates[1]
    }

    return { totalDaysInTerm, sledDate, totalDaysMTD, mtdDate }
  }
}

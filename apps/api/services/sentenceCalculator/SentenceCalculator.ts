import { addMonths, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { Sentence, Calculation } from './types'

export default class SentenceCalculator {
  private sentence: Sentence
  private calculation: Calculation
  
  constructor (sentence: Sentence){
      this.sentence = sentence
      const totalDaysInTerm = this.getTotalDaysInTerm()
      const totalDaysMTD = this.getTotalDaysMTD()

     this.calculation = {
      totalDaysInTerm: totalDaysInTerm,
      sledDate: this.getSledDate(totalDaysInTerm),
      totalDaysMTD: totalDaysMTD,
      mtdDate: this.getMTDDate(totalDaysMTD),
      adjustedMtdDate: new Date,
      adjustedSledDate: new Date
    }
  }
  getTotalDaysInTerm(): number {
    const { from, durationMonths } = this.sentence.term[0]
    const utcFrom = new UTCDate(from)
    const to = addMonths(utcFrom, durationMonths)

    return differenceInCalendarDays(to, utcFrom)
  }

  getSledDate( totalDaysInTerm: number): Date {
    const { from } = this.sentence.term[0]
    // add term starting from the sentence day
    return addDays(new UTCDate(from), totalDaysInTerm - 1)
  }

  getTotalDaysMTD(): number {
    const totalDaysInTerm: number = this.getTotalDaysInTerm()
    return Math.round(totalDaysInTerm / 2)
  }

  getMTDDate(totalDaysMTD: number): Date {
    const { from } = this.sentence.term[0]

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

    const {remand} = sentence.term[0]

    if(remand > 0){
        let adjustedDates = this.applyRemand( this.calculation.sledDate,  this.calculation.mtdDate, remand);
        this.calculation.adjustedSledDate = adjustedDates[0]
        this.calculation. adjustedMtdDate  = adjustedDates[1]
    }

    return this.calculation
  }
}

import { addMonths, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { Sentence, Calculation, Adjustment  } from './types'

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
      adjustments: []
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

  applyRemand(remand: number): Adjustment {
    const adjustment: Adjustment = {
      type: 'remand',
      sledDate: subDays(this.calculation.sledDate, remand),
      mtdDate: subDays(this.calculation.mtdDate, remand),
    }

    this.calculation.adjustments.push(adjustment)

    return adjustment
  }
  

  getTotalCalculation(sentence: Sentence): Calculation {

    const {remand} = sentence.term[0]
    if(remand > 0){
        this.applyRemand(remand);
    }

    return this.calculation
  }
}

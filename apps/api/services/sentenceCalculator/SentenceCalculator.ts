import { addMonths, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { Sentence, Calculation, AdjustmentRecord, Reason } from './types'

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
      adjustmentRecords: [],
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

  applyRemand(remand: number, reason: Reason): AdjustmentRecord {
    // save existing sled and mtd prior adjustment
    const adjustment: AdjustmentRecord = {
      type: reason,
      sledDate: this.calculation.sledDate,
      mtdDate: this.calculation.mtdDate,
    }
    this.calculation.adjustmentRecords.push(adjustment)

    // if remand covers the whole sentence, there's no sentence left to serve:
    // sled and mtd both collapse to the sentence start date
    if (remand >= this.calculation.totalDaysInTerm) {
      const sentenceStart = new UTCDate(this.sentence.term[0].from)
      this.calculation.sledDate = sentenceStart
      this.calculation.mtdDate = sentenceStart
    } else {
      this.calculation.sledDate = subDays(this.calculation.sledDate, remand)
      this.calculation.mtdDate = subDays(this.calculation.mtdDate, remand)
    }

    return adjustment
  }

  getCalculation(): Calculation {
    return this.calculation
  }

  adjustCalculation(reason: Reason): Calculation {
    if (reason === Reason.remand) {
      const {remand} = this.sentence.term[0]
      if(remand > 0){
        this.applyRemand(remand, reason);
      }
    }

    return this.calculation
  }
}

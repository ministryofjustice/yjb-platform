import { addMonths, addDays, subDays,subMonths, differenceInCalendarDays, endOfToday } from 'date-fns'
import { UTCDate } from '@date-fns/utc'
import { InputSentences, OutputCalculation, PastCalculations, AdjustmentTypes } from './types'

export default class SentenceCalculator {
  private sentence: InputSentences

  private calculation: OutputCalculation

  constructor(sentence: InputSentences) {
    this.sentence = sentence
    const totalDaysInTerm = this.getTotalDaysInTerm()
    const totalDaysMTD = this.getTotalDaysMTD()
    const mtd = this.getMTDDate(totalDaysMTD)
    const etd = this.getETDDate(mtd, totalDaysInTerm)
    const ltd = this.getLTDDate(mtd, totalDaysInTerm)

    this.calculation = {
      totalDaysInTerm,
      totalDaysMTD,
      effectiveDates: {
        sled: this.getSledDate(totalDaysInTerm),
        mtd: mtd,
        ltd: ltd,
        etd: etd,
      },
      pastCalculations: [],
    }
  }

  getTotalDaysInTerm(): number {
    const { from, durationMonths } = this.sentence.inputIndividualSentences[0]
    const utcFrom = new UTCDate(from)
    const to = addMonths(utcFrom, durationMonths)

    return differenceInCalendarDays(to, utcFrom)
  }

  getSledDate(totalDaysInTerm: number): Date {
    const { from } = this.sentence.inputIndividualSentences[0]
    // add term starting from the sentence day
    return addDays(new UTCDate(from), totalDaysInTerm - 1)
  }

  getTotalDaysMTD(): number {
    const totalDaysInTerm: number = this.getTotalDaysInTerm()
    return Math.round(totalDaysInTerm / 2)
  }

  getMTDDate(totalDaysMTD: number): Date {
    const { from } = this.sentence.inputIndividualSentences[0]

    // add mtd starting from the sentence day
    return addDays(new UTCDate(from), totalDaysMTD - 1)
  }

  getETDDate(mtd: Date, totalDaysInTerm: number): Date {

    //TODO add logic the leth should be between 8 to 18 months, otherwise happens what?
    return subMonths(new UTCDate(mtd), 1);
  }

  getLTDDate(mtd: Date, totalDaysInTerm: number): Date {

    //TODO again between 8 to 18 months, otherwise happens what?
    return addMonths(new UTCDate(mtd), 1);
  }

  applyRemand(remand: number, reason: AdjustmentTypes): PastCalculations {
    // save existing sled and mtd prior adjustment
    const adjustment: PastCalculations = {
      adjustmentReason: reason,
      oldSled: this.calculation.effectiveDates.sled,
      oldMtd: this.calculation.effectiveDates.mtd,
    }
    this.calculation.pastCalculations.push(adjustment)

    // if remand covers the whole sentence, there's no sentence left to serve:
    // sled and mtd both collapse to the sentence start date
    if (remand >= this.calculation.totalDaysInTerm) {
      const sentenceStart = new UTCDate(this.sentence.inputIndividualSentences[0].from)
      this.calculation.effectiveDates.sled = sentenceStart
      this.calculation.effectiveDates.mtd = sentenceStart
    } else {
      this.calculation.effectiveDates.sled = subDays(this.calculation.effectiveDates.sled, remand)
      this.calculation.effectiveDates.mtd = subDays(this.calculation.effectiveDates.mtd, remand)
      this.calculation.effectiveDates.etd = this.getETDDate(this.calculation.effectiveDates.mtd, this.calculation.totalDaysInTerm)
      this.calculation.effectiveDates.ltd = this.getLTDDate(this.calculation.effectiveDates.mtd, this.calculation.totalDaysInTerm)
    }

    return adjustment
  }

  getCalculation(): OutputCalculation {
    return this.calculation
  }

  adjustCalculation(reason: AdjustmentTypes): OutputCalculation {
    if (reason === AdjustmentTypes.remand) {
      const { remand } = this.sentence
      if (remand > 0) {
        this.applyRemand(remand, reason)
      }
    }

    return this.calculation
  }
}

import { UTCDate } from '@date-fns/utc'
import {
  getTotalDaysInTerm,
  getTotalDaysMTD,
  addDaysToDate,
  increaseTotalNumRTBDays,
  getETDDate,
  getLTDDate,
  adjustCalculation,
} from './lib'
import {
  InputSentences,
  InputIndividualSentence,
  OutputCalculation,
  CalculatedTerm,
  EffectiveDates,
  RecordOfAdjustment,
  RemandAdjustment,
  TaggedBailAdjustment,
  AdjustmentTypes,
} from './types'

export default class SentenceCalculator {
  private sentence: InputSentences

  private calculation: OutputCalculation

  constructor(sentence: InputSentences) {
    this.sentence = sentence

    this.calculation = {
      calculatedTerms: [],
      effectiveDates: {} as EffectiveDates,
      effectiveDatesPastAdjustments: [],
      ltd: new Date(0),
      etd: new Date(0),
    }

    // get all term dates, for now it will always be one
    this.sentence.inputIndividualSentences.forEach(inputSentence => {
      this.calculation.calculatedTerms.push(this.calculateTerm(inputSentence))
    })

    // for now 1 sentecen only and without any adjustemnts the effecive dates match the terms (to apply consecuteve concurent sentences in future)
    this.calculation.effectiveDates = {
      // TODO calculate the real total
      totalNumberOfRemandAndTaggedBailDays: 0,
      sled: this.calculation.calculatedTerms[0].sled,
      mtd: this.calculation.calculatedTerms[0].mtd,
      // probably out of scope for now, leve just for consistancy with sheet
      TUSED: new Date(0),
    }
    this.calculation.ltd = this.getLTDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )
    this.calculation.etd = this.getETDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )
  }

  calculateTerm(inputSentence: InputIndividualSentence): CalculatedTerm {
    const totalDaysInTerm = this.getTotalDaysInTerm()
    const totalDaysMTD = this.getTotalDaysMTD()

    return {
      inputSentence,
      totalDaysInTerm,
      totalDaysMTD,
      sled: this.getSledDate(totalDaysInTerm),
      mtd: this.getMTDDate(totalDaysMTD),
    }
  }

  getTotalDaysInTerm(): number {
    return getTotalDaysInTerm(this.sentence.inputIndividualSentences[0])
  }

  getSledDate(totalDaysInTerm: number): Date {
    return addDaysToDate(totalDaysInTerm, this.sentence.inputIndividualSentences[0].from)
  }

  getTotalDaysMTD(): number {
    return getTotalDaysMTD(this.getTotalDaysInTerm())
  }

  getMTDDate(totalDaysMTD: number): Date {
    return addDaysToDate(totalDaysMTD, this.sentence.inputIndividualSentences[0].from)
  }

  increaseTotalNumRTBDays(currentTotal: number, incrementor: number): number {
    return increaseTotalNumRTBDays(currentTotal, incrementor)
  }

  getETDDate(mtd: Date, sentenceDuration: number): Date | 0 {
    return getETDDate(new UTCDate(mtd), sentenceDuration)
  }

  getLTDDate(mtd: Date, sentenceDuration: number): Date | 0 {
    return getLTDDate(new UTCDate(mtd), sentenceDuration)
  }

  applyRemand(remand: number, _reason: AdjustmentTypes): RecordOfAdjustment {
    const remandInput: RemandAdjustment = { ...this.sentence.remandAdjustment!, days: remand }
    const { newEffectiveDates, newRecordOfAdjustment } = adjustCalculation(this.calculation, remandInput)

    this.calculation.effectiveDatesPastAdjustments.push(newRecordOfAdjustment)
    this.calculation.effectiveDates = newEffectiveDates
    this.calculation.etd = this.getETDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )
    this.calculation.ltd = this.getLTDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )

    return newRecordOfAdjustment
  }

  applyTaggedBail(taggedBail: number, _reason: AdjustmentTypes): RecordOfAdjustment {
    const taggedBailInput: TaggedBailAdjustment = { ...this.sentence.taggedBailAdjustment!, days: taggedBail }
    const { newEffectiveDates, newRecordOfAdjustment } = adjustCalculation(this.calculation, taggedBailInput)

    this.calculation.effectiveDatesPastAdjustments.push(newRecordOfAdjustment)
    this.calculation.effectiveDates = newEffectiveDates
    this.calculation.etd = this.getETDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )
    this.calculation.ltd = this.getLTDDate(
      this.calculation.effectiveDates.mtd,
      this.sentence.inputIndividualSentences[0].durationMonths,
    )

    return newRecordOfAdjustment
  }

  getCalculation(): OutputCalculation {
    return this.calculation
  }

  adjustCalculation(reason: AdjustmentTypes): OutputCalculation {
    if (reason === AdjustmentTypes.remand) {
      const remand = this.sentence.remandAdjustment?.days ?? 0
      if (remand > 0) {
        this.applyRemand(remand, reason)
      }
    } else if (reason === AdjustmentTypes.taggedBail) {
      const taggedBail = this.sentence.taggedBailAdjustment?.days ?? 0
      if (taggedBail > 0) {
        this.applyTaggedBail(taggedBail, reason)
      }
    }

    return this.calculation
  }
}

import { UTCDate } from '@date-fns/utc'
import { subDays, addMonths, addDays, subMonths, differenceInCalendarDays } from 'date-fns'
import { InputIndividualSentence, OutputCalculation, InputAdjustment, RecordOfAdjustment, RemandAdjustment, TaggedBailAdjustment } from './types'

export function getTotalDaysInTerm(sentenceInput: InputIndividualSentence): number {
  const utcFrom = new UTCDate(sentenceInput.from)
  const to = addMonths(utcFrom, sentenceInput.durationMonths)

  return differenceInCalendarDays(to, utcFrom)
}

export function getTotalDaysMTD(totalDaysInTerm: number): number {
  return Math.round(totalDaysInTerm / 2)
}

export function addDaysToDate(daysToAdd: number, dateToIncrease: Date): Date {
  return addDays(new UTCDate(dateToIncrease), daysToAdd - 1)
}

export function increaseTotalNumRTBDays(currentTotal: number, incrementor: number): number {
  return currentTotal + incrementor
}

export function getETDDate(mtd: Date, sentenceLenth: number): Date | 0 {
  if (sentenceLenth > 8 && sentenceLenth < 18) {
    return subMonths(new UTCDate(mtd), 1)
  }
  if (sentenceLenth > 18) {
    return subMonths(new UTCDate(mtd), 2)
  }
  // not eligible: sentence is less than 8 months
  return 0
}

export function getLTDDate(mtd: Date, sentenceLenth: number): Date | 0 {
  if (sentenceLenth > 8 && sentenceLenth < 18) {
    return addMonths(new UTCDate(mtd), 1)
  }
  if (sentenceLenth > 18) {
    return addMonths(new UTCDate(mtd), 2)
  }
  // not eligible: sentence is less than 8 months
  return 0
}

export function adjustCalculation(srcCal: OutputCalculation, inputAdjustment: InputAdjustment): OutputCalculation {
  // save existing effective dates and adjustment parameters prior to the adjustment
  // (spread into a new object - effectiveDates is mutated in place below, so a live reference would show the new values too)
  const outputCal: OutputCalculation = srcCal
  const adjustment: RecordOfAdjustment = {
    adjustmentReason: inputAdjustment.name,
    adjustmentParameters: inputAdjustment,
    pastEffectiveDates: { ...srcCal.effectiveDates },
  }
  outputCal.effectiveDatesPastAdjustments.push(adjustment)

  const totalRTBD = srcCal.effectiveDates.totalNumberOfRemandAndTaggedBailDays
  outputCal.effectiveDates.totalNumberOfRemandAndTaggedBailDays = increaseTotalNumRTBDays(
    totalRTBD,
    inputAdjustment.days,
  )

  // if remand covers the whole sentence, there's no sentence left to serve:
  // sled and mtd both collapse to the sentence start date
  if (inputAdjustment.days >= srcCal.calculatedTerms[0].totalDaysInTerm) {
    const sentenceStart = new UTCDate(srcCal.calculatedTerms[0].inputSentence.from)
    outputCal.effectiveDates.sled = sentenceStart
    outputCal.effectiveDates.mtd = sentenceStart
  } else {
    outputCal.effectiveDates.sled = subDays(srcCal.effectiveDates.sled, inputAdjustment.days)
    outputCal.effectiveDates.mtd = subDays(srcCal.effectiveDates.mtd, inputAdjustment.days)
    outputCal.etd = getETDDate(outputCal.effectiveDates.mtd, srcCal.calculatedTerms[0].inputSentence.durationMonths)
    outputCal.ltd = getLTDDate(outputCal.effectiveDates.mtd, srcCal.calculatedTerms[0].inputSentence.durationMonths)
  }

  return outputCal
}

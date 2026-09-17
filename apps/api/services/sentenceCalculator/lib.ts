import { UTCDate } from '@date-fns/utc'
import { subDays, addMonths, addDays, subMonths, differenceInCalendarDays } from 'date-fns'
import {
  InputIndividualSentence,
  OutputCalculation,
  InputAdjustment,
  RecordOfAdjustment,
  EffectiveDates,
  AdjustmentResult,
  CalculatedTerm,
} from './types'

export function getTotalDaysInTerm(sentenceInput: InputIndividualSentence): number {
  const utcFrom = new UTCDate(sentenceInput.from)
  const to = addMonths(utcFrom, sentenceInput.durationMonths)

  return differenceInCalendarDays(to, utcFrom)
}

export function getTotalDaysMTD(totalDaysInTerm: number): number {
  return Math.ceil(totalDaysInTerm / 2)
}

export function addDaysToDate(daysToAdd: number, dateToIncrease: Date): Date {
  return addDays(new UTCDate(dateToIncrease), daysToAdd - 1)
}

export function increaseTotalNumRTBDays(currentTotal: number, incrementor: number): number {
  return currentTotal + incrementor
}

export function getSledDate(totalDaysInTerm: number, from: Date): Date {
  return addDaysToDate(totalDaysInTerm, from)
}

export function getMTDDate(totalDaysMTD: number, from: Date): Date {
  return addDaysToDate(totalDaysMTD, from)
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

export function calculateTerm(inputSentence: InputIndividualSentence): CalculatedTerm {
  const totalDaysInTerm = getTotalDaysInTerm(inputSentence)
  const totalDaysMTD = getTotalDaysMTD(totalDaysInTerm)

  return {
    inputSentence,
    totalDaysInTerm,
    totalDaysMTD,
    sled: getSledDate(totalDaysInTerm, inputSentence.from),
    mtd: getMTDDate(totalDaysMTD, inputSentence.from),
  }
}

export function adjustCalculation(
  srcCal: Readonly<OutputCalculation>,
  inputAdjustment: Readonly<InputAdjustment>,
): AdjustmentResult {
  // save existing effective dates and adjustment parameters prior to the adjustment
  const outputAdjustmentRecord: RecordOfAdjustment = {
    adjustmentReason: inputAdjustment.name,
    adjustmentParameters: inputAdjustment,
    pastEffectiveDates: { ...srcCal.effectiveDates },
  }

  const sentenceStartDate = new UTCDate(srcCal.calculatedTerms[0].inputSentence.from)
  let { unusedAdjustmentDays } = srcCal
  const initialMtdBudget = differenceInCalendarDays(srcCal.effectiveDates.mtd, sentenceStartDate) + 1
  const initialSledBudget = differenceInCalendarDays(srcCal.effectiveDates.sled, sentenceStartDate) + 1

  // MTD and SLED each track their own remaining budget independently: every adjustment
  // subtracts its full day count from both, and each collapses to the sentence start
  // once its own budget is exhausted - there's no carryover from one to the other
  const outputEffectiveDatesMTD =
    inputAdjustment.days >= initialMtdBudget
      ? sentenceStartDate
      : subDays(srcCal.effectiveDates.mtd, inputAdjustment.days)

  const outputEffectiveDatesSled =
    inputAdjustment.days >= initialMtdBudget
      ? sentenceStartDate
      : subDays(srcCal.effectiveDates.sled, inputAdjustment.days)

  if (inputAdjustment.days >= initialMtdBudget) { 
    // record how far past the MTD budget this adjustment went, for the audit trail
    unusedAdjustmentDays = Math.max(0, inputAdjustment.days - initialMtdBudget)
  }

  const outputNewEffectiveDates: EffectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: increaseTotalNumRTBDays(
      srcCal.effectiveDates.totalNumberOfRemandAndTaggedBailDays,
      inputAdjustment.days,
    ),
    sled: outputEffectiveDatesSled,
    mtd: outputEffectiveDatesMTD,
    TUSED: new Date(0),
  }

  return {
    newEffectiveDates: outputNewEffectiveDates,
    newRecordOfAdjustment: outputAdjustmentRecord,
    unusedAdjustmentDays,
  }
}

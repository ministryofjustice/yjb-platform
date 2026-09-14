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
  return Math.round(totalDaysInTerm / 2)
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

export function adjustCalculation(srcCal: OutputCalculation, inputAdjustment: InputAdjustment): AdjustmentResult {
  // save existing effective dates and adjustment parameters prior to the adjustment
  
  let outputEffectiveDatesSled: Date
  let outputEffectiveDatesMTD: Date

  const outputAdjustmentRecord: RecordOfAdjustment = {
    adjustmentReason: inputAdjustment.name,
    adjustmentParameters: inputAdjustment,
    pastEffectiveDates: { ...srcCal.effectiveDates },
    remainingAdjustmentDays: undefined
  }

  // if remand covers the whole sentence, there's no sentence left to serve
  if (inputAdjustment.days >= srcCal.calculatedTerms[0].totalDaysMTD) {
    
    //collapse mtd to the day the sentence began
    const sentenceStartDate = new UTCDate(srcCal.calculatedTerms[0].inputSentence.from)
    outputEffectiveDatesMTD = sentenceStartDate

    const remainingAdjustmentDays = inputAdjustment.days - srcCal.calculatedTerms[0].totalDaysMTD
    //if adjustment is bigger even then the total days in term, collapse it too
    if(inputAdjustment.days >= srcCal.calculatedTerms[0].totalDaysInTerm){
      outputEffectiveDatesSled = sentenceStartDate
    }else{
      //if adjustment not bigger then total days in term, then extract remaining Adjustment and 
      //recalculate the SLED with it
      outputEffectiveDatesSled = subDays(srcCal.effectiveDates.sled, remainingAdjustmentDays)
    }
    outputAdjustmentRecord.remainingAdjustmentDays = remainingAdjustmentDays
  } else {
    outputEffectiveDatesSled = subDays(srcCal.effectiveDates.sled, inputAdjustment.days)
    outputEffectiveDatesMTD = subDays(srcCal.effectiveDates.mtd, inputAdjustment.days)
  }

  const outputNewEffeciveDates: EffectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: increaseTotalNumRTBDays(
    srcCal.effectiveDates.totalNumberOfRemandAndTaggedBailDays,
    inputAdjustment.days,
  ),
    sled: outputEffectiveDatesSled,
    mtd: outputEffectiveDatesMTD,
    TUSED: new Date(0),
  }


  return {
    newEffectiveDates: outputNewEffeciveDates,
    newRecordOfAdjustment: outputAdjustmentRecord,
  }
}

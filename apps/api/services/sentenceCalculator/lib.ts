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
  transferDatesObj,
  DtoEligibilityStatus,
  buildTransferDatesObj,
  buildfinalDatesObj,
  AppliedAdjustmentStatus,
  finalDatesObj,
} from '@yjb-platform/shared-types'

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

export function getETDDate(mtd: Date, sentenceLenth: number): transferDatesObj {
  if (sentenceLenth > 8 && sentenceLenth < 18) {
    return buildTransferDatesObj(DtoEligibilityStatus.oneMonth, subMonths(new UTCDate(mtd), 1))
  }
  if (sentenceLenth > 18) {
    return buildTransferDatesObj(DtoEligibilityStatus.twoMonths, subMonths(new UTCDate(mtd), 2))
  }
  return buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0)
}

export function getLTDDate(mtd: Date, sentenceLenth: number): transferDatesObj {
  if (sentenceLenth > 8 && sentenceLenth < 18) {
    return buildTransferDatesObj(DtoEligibilityStatus.oneMonth, addMonths(new UTCDate(mtd), 1))
  }
  if (sentenceLenth > 18) {
    return buildTransferDatesObj(DtoEligibilityStatus.twoMonths, addMonths(new UTCDate(mtd), 2))
  }
  return buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0)
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

// builds the finalDatesObj for one field (sled or mtd) once its own collapse
// decision and post-adjustment date are known - unusedDays is always the shared,
// MTD-budget-derived counter (see adjustCalculation), not this field's own excess
function buildFieldFinalDatesObj(
  isCollapsed: boolean,
  data: Date,
  originalDate: Date,
  daysApplied: number,
  unusedDays: number,
): finalDatesObj {
  if (!isCollapsed) {
    return buildfinalDatesObj(AppliedAdjustmentStatus.applied, data, originalDate, daysApplied)
  }
  if (unusedDays > 0) {
    return buildfinalDatesObj(AppliedAdjustmentStatus.collapsedUnused, data, undefined, undefined, unusedDays)
  }
  return buildfinalDatesObj(AppliedAdjustmentStatus.collapsed, data)
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
  const initialMtdBudget = differenceInCalendarDays(srcCal.effectiveDates.mtd.data, sentenceStartDate) + 1
  const initialSledBudget = differenceInCalendarDays(srcCal.effectiveDates.sled.data, sentenceStartDate) + 1

  // MTD and SLED each track their own remaining budget independently: every adjustment
  // subtracts its full day count from both, and each collapses to the sentence start
  // once its own budget is exhausted - there's no carryover from one to the other
  const isMtdCollapsed = inputAdjustment.days >= initialMtdBudget
  const isSledCollapsed = inputAdjustment.days >= initialSledBudget

  const outputEffectiveDatesMTD = isMtdCollapsed
    ? sentenceStartDate
    : subDays(srcCal.effectiveDates.mtd.data, inputAdjustment.days)

  const outputEffectiveDatesSled = isSledCollapsed
    ? sentenceStartDate
    : subDays(srcCal.effectiveDates.sled.data, inputAdjustment.days)

  if (isMtdCollapsed) {
    // record how far past the MTD budget this adjustment went, for the audit trail
    unusedAdjustmentDays = Math.max(0, inputAdjustment.days - initialMtdBudget)
  }

  // the "applied" message always describes the net shift from the originally
  // calculated date using the cumulative total, not this step's own days -
  // subDays chaining is additive, so this stays accurate across multiple adjustments
  const cumulativeAdjustmentDays = increaseTotalNumRTBDays(
    srcCal.effectiveDates.totalNumberOfRemandAndTaggedBailDays,
    inputAdjustment.days,
  )

  const outputNewEffectiveDates: EffectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: cumulativeAdjustmentDays,
    sled: buildFieldFinalDatesObj(
      isSledCollapsed,
      outputEffectiveDatesSled,
      srcCal.calculatedTerms[0].sled,
      cumulativeAdjustmentDays,
      unusedAdjustmentDays,
    ),
    mtd: buildFieldFinalDatesObj(
      isMtdCollapsed,
      outputEffectiveDatesMTD,
      srcCal.calculatedTerms[0].mtd,
      cumulativeAdjustmentDays,
      unusedAdjustmentDays,
    ),
    TUSED: new Date(0),
  }

  return {
    newEffectiveDates: outputNewEffectiveDates,
    newRecordOfAdjustment: outputAdjustmentRecord,
    unusedAdjustmentDays,
  }
}

export function calculateAdjustmentStart(sentenceStart: Date, adjustmentLenth: number): Date {
  return subDays(sentenceStart, adjustmentLenth)
}

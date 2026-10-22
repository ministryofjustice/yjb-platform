import { UTCDate } from '@date-fns/utc'
import {
  InputSentences,
  OutputCalculation,
  EffectiveDates,
  AdjustmentResult,
  DtoEligibilityStatus,
  AppliedAdjustmentStatus,
} from '@yjb-platform/shared-types'
import { buildTransferDatesObj, buildfinalDatesObj } from './helpers/dateObjects'
import { getLTDDate, getETDDate, getERDDate, adjustCalculation, calculateTerm, calculateRemandDays } from './lib'

export default function calculateDTOSentence(inputSentence: InputSentences): OutputCalculation {
  const outputCalculation: OutputCalculation = {
    calculatedTerms: [],
    effectiveDates: {} as EffectiveDates,
    effectiveDatesPastAdjustments: [],
    ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
    etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
    erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
    unusedAdjustmentDays: 0,
    remandPeriodDays: 0,
  }

  // get all term dates, for now it will always be one
  inputSentence.inputIndividualSentences.forEach(individualSentence => {
    outputCalculation.calculatedTerms.push(calculateTerm(individualSentence))
  })

  // for concurrent or conseutive sentnces itterate though terms and calculate the effective dates based on the term with the longest duration
  // for now 1 term only; prior adjustments the effective dates match the term
  outputCalculation.effectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, outputCalculation.calculatedTerms[0].sled.data),
    mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, outputCalculation.calculatedTerms[0].mtd.data),
    TUSED: new Date(0),
  }

  // apply adjustments
  // remand arrives as a start date only, so its days are worked out from the sentence start
  const { remandAdjustment, taggedBailAdjustment } = inputSentence
  const remandDays = remandAdjustment
    ? calculateRemandDays(inputSentence.inputIndividualSentences[0].from, remandAdjustment.startDate)
    : 0

  if (remandAdjustment && remandDays > 0) {
    const adjustmentResult: AdjustmentResult = adjustCalculation(outputCalculation, remandAdjustment, remandDays)
    outputCalculation.effectiveDates = adjustmentResult.newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(adjustmentResult.newRecordOfAdjustment)
    outputCalculation.unusedAdjustmentDays = adjustmentResult.unusedAdjustmentDays
    outputCalculation.remandPeriodDays = remandDays
  }

  if (taggedBailAdjustment && taggedBailAdjustment.days > 0) {
    const adjustmentResult: AdjustmentResult = adjustCalculation(
      outputCalculation,
      taggedBailAdjustment,
      taggedBailAdjustment.days,
    )
    outputCalculation.effectiveDates = adjustmentResult.newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(adjustmentResult.newRecordOfAdjustment)
    outputCalculation.unusedAdjustmentDays = adjustmentResult.unusedAdjustmentDays
  }

  // finally calculate the LTD and ETD based on the effective dates post adjustments
  // leave it 0 if we have collapsed  the MTD - compared by value, as the collapsed
  // MTD is a new date object set to the sentence start rather than the input date itself
  const isMtdCollapsed =
    new UTCDate(outputCalculation.effectiveDates.mtd.data).getTime() ===
    new UTCDate(inputSentence.inputIndividualSentences[0].from).getTime()
  if (!isMtdCollapsed) {
    outputCalculation.ltd = getLTDDate(
      outputCalculation.effectiveDates.mtd.data,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )
    outputCalculation.etd = getETDDate(
      outputCalculation.effectiveDates.mtd.data,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )
  }

  // the ERD follows the final ETD, so it's set outside the MTD check above - a child
  // who isn't eligible for early release is always shown as not eligible
  outputCalculation.erd = getERDDate(outputCalculation.etd, inputSentence.erdEligible)

  return outputCalculation
}

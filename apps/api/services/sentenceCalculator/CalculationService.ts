import { InputSentences, OutputCalculation, EffectiveDates, AdjustmentResult } from './types'
import { getLTDDate, getETDDate, adjustCalculation, calculateTerm } from './lib'

export default function calculateDTOSentence(inputSentence: InputSentences): OutputCalculation {
  const outputCalculation: OutputCalculation = {
    calculatedTerms: [],
    effectiveDates: {} as EffectiveDates,
    effectiveDatesPastAdjustments: [],
    ltd: new Date(0),
    etd: new Date(0),
    unusedAdjustmentDays: 0,
  }

  // get all term dates, for now it will always be one
  inputSentence.inputIndividualSentences.forEach(individualSentence => {
    outputCalculation.calculatedTerms.push(calculateTerm(individualSentence))
  })

  // for concurrent or conseutive sentnces itterate though terms and calculate the effective dates based on the term with the longest duration
  // for now 1 term only; prior adjustments the effective dates match the term
  outputCalculation.effectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: outputCalculation.calculatedTerms[0].sled,
    mtd: outputCalculation.calculatedTerms[0].mtd,
    TUSED: new Date(0),
  }

  // apply adjustments
  if (inputSentence.remandAdjustment && inputSentence.remandAdjustment.days > 0) {
    const adjustmentResult: AdjustmentResult = adjustCalculation(outputCalculation, inputSentence.remandAdjustment)
    outputCalculation.effectiveDates = adjustmentResult.newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(adjustmentResult.newRecordOfAdjustment)
    outputCalculation.unusedAdjustmentDays = adjustmentResult.unusedAdjustmentDays
  }

  if (inputSentence.taggedBailAdjustment && inputSentence.taggedBailAdjustment.days > 0) {
    const adjustmentResult: AdjustmentResult = adjustCalculation(outputCalculation, inputSentence.taggedBailAdjustment)
    outputCalculation.effectiveDates = adjustmentResult.newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(adjustmentResult.newRecordOfAdjustment)
    outputCalculation.unusedAdjustmentDays = adjustmentResult.unusedAdjustmentDays
  }

  // finally calculate the LTD and ETD based on the effective dates post adjustments
  // leave it 0 if we have collapsed  the MTD
  if (outputCalculation.effectiveDates.mtd !== inputSentence.inputIndividualSentences[0].from) {
    outputCalculation.ltd = getLTDDate(
      outputCalculation.effectiveDates.mtd,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )
    outputCalculation.etd = getETDDate(
      outputCalculation.effectiveDates.mtd,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )
  }

  return outputCalculation
}

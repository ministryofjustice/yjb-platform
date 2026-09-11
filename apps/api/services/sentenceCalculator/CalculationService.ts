import { InputSentences, OutputCalculation, EffectiveDates } from './types'
import { getLTDDate, getETDDate, adjustCalculation, calculateTerm } from './lib'

export function calculateDTOSentence(inputSentence: InputSentences): OutputCalculation {
  const outputCalculation: OutputCalculation = {
    calculatedTerms: [],
    effectiveDates: {} as EffectiveDates,
    effectiveDatesPastAdjustments: [],
    ltd: new Date(0),
    etd: new Date(0),
  }

  // get all term dates, for now it will always be one
  inputSentence.inputIndividualSentences.forEach(individualSentence => {
    outputCalculation.calculatedTerms.push(calculateTerm(individualSentence))
  })

  // for now 1 sentence only and without any adjustments the effective dates match the terms
  outputCalculation.effectiveDates = {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: outputCalculation.calculatedTerms[0].sled,
    mtd: outputCalculation.calculatedTerms[0].mtd,
    TUSED: new Date(0),
  }

  if (inputSentence.remandAdjustment && inputSentence.remandAdjustment.days > 0) {
    const { newEffectiveDates, newRecordOfAdjustment } = adjustCalculation(outputCalculation, inputSentence.remandAdjustment)
    outputCalculation.effectiveDates = newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(newRecordOfAdjustment)
  }

  if (inputSentence.taggedBailAdjustment && inputSentence.taggedBailAdjustment.days > 0) {
    const { newEffectiveDates, newRecordOfAdjustment } = adjustCalculation(
      outputCalculation,
      inputSentence.taggedBailAdjustment,
    )
    outputCalculation.effectiveDates = newEffectiveDates
    outputCalculation.effectiveDatesPastAdjustments.push(newRecordOfAdjustment)
  }

  outputCalculation.ltd = getLTDDate(
    outputCalculation.effectiveDates.mtd,
    inputSentence.inputIndividualSentences[0].durationMonths,
  )
  outputCalculation.etd = getETDDate(
    outputCalculation.effectiveDates.mtd,
    inputSentence.inputIndividualSentences[0].durationMonths,
  )

  return outputCalculation
}

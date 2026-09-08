import { InputSentences, OutputCalculation, AdjustmentTypes } from '../services/sentenceCalculator/types'
import SentenceCalculator from '../services/sentenceCalculator/SentenceCalculator'

// TODO: extract this in parser class which also does simple validation use zod
export default function sentenceCalculatorController(sentence: InputSentences): OutputCalculation {
  const deserialized: InputSentences = {
    ...sentence,
    inputIndividualSentences: sentence.inputIndividualSentences.map(term => ({
      ...term,
      from: new Date(term.from),
    })),
    remandAdjustment: sentence.remandAdjustment
      ? {
          ...sentence.remandAdjustment,
          startDate: new Date(sentence.remandAdjustment.startDate),
        }
      : sentence.remandAdjustment,
  }

  const sentenceCalc = new SentenceCalculator(deserialized)
  if ((deserialized.remandAdjustment?.days ?? 0) > 0) {
    sentenceCalc.adjustCalculation(AdjustmentTypes.remand)
  }
  if ((deserialized.taggedBailAdjustment?.days ?? 0) > 0) {
    sentenceCalc.adjustCalculation(AdjustmentTypes.taggedBail)
  }
  return sentenceCalc.getCalculation()
}

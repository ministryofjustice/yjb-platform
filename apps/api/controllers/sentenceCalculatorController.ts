import { InputSentences, OutputCalculation, AdjustmentTypes } from '../services/sentenceCalculator/types'
import SentenceCalculator from '../services/sentenceCalculator/SentenceCalculator'
import calculateDTOSentence from '../services/sentenceCalculator/CalculationService'


export default function sentenceCalculatorController(sentence: InputSentences): OutputCalculation {
  // TODO: extract this in parser class which also does simple validation use zod
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

  return calculateDTOSentence(deserialized)
}

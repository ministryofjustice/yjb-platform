import { InputSentences, OutputCalculation } from '../services/sentenceCalculator/types'
import calculateDTOSentence from '../services/sentenceCalculator/CalculationService'

export default class SentenceCalculatorController {
  getCalculation(deserializedInputSentence: InputSentences): OutputCalculation {
    return calculateDTOSentence(deserializedInputSentence)
  }
}

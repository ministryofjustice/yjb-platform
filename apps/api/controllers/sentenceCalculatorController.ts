import { InputSentences, OutputCalculation } from '@yjb-platform/shared-types'
import calculateDTOSentence from '../services/sentenceCalculator/CalculationService'

export default class SentenceCalculatorController {
  getCalculation(deserializedInputSentence: InputSentences): OutputCalculation {
    return calculateDTOSentence(deserializedInputSentence)
  }
}

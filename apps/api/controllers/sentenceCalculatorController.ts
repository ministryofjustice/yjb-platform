import { InputSentences, OutputCalculation } from '../services/sentenceCalculator/types'
import calculateDTOSentence from '../services/sentenceCalculator/CalculationService'

export default class SentenceCalculatorController {
  getCalculation(body: unknown): OutputCalculation {
    const deserializedInput = this.parseInput(body)
    return calculateDTOSentence(deserializedInput)
  }

  parseInput(body: unknown): InputSentences{
    // TODO: This entire method should be replaced with proper zod validation
    const sentence = body as InputSentences
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

    return deserialized
  }

  formatOutputCalculation(outputCalc: OutputCalculation) {
    return JSON.stringify(outputCalc, this.dateOnlyReplacer)
  }

  dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
    const raw = this[key]
    return raw instanceof Date ? raw.toISOString().slice(0, 10) : value
  }
}

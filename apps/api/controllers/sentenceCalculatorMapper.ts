import { inputSentencesSchema, InputSentences, OutputCalculation } from '@yjb-platform/shared-types'
import { calculateAdjustmentStart } from '../services/sentenceCalculator/lib'

export function parseInputSentences(body: unknown): InputSentences {
  const parsedInput = inputSentencesSchema.parse(body)
  // for remand with no start date extract the start date
  if (parsedInput.remandAdjustment && !parsedInput.remandAdjustment!.startDate) {
    parsedInput.remandAdjustment!.startDate = calculateAdjustmentStart(
      parsedInput.inputIndividualSentences[0].from,
      parsedInput.remandAdjustment!.days,
    )
  }
  return parsedInput
}

function dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key]
  return raw instanceof Date ? raw.toISOString().slice(0, 10) : value
}

export function formatOutputCalculation(outputCalc: OutputCalculation): string {
  return JSON.stringify(outputCalc, dateOnlyReplacer)
}

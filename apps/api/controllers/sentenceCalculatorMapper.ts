import { inputSentencesSchema, InputSentences, OutputCalculation } from '@yjb-platform/shared-types'
import { calculateAdjustmentStart, calculateRemandDays } from '../services/sentenceCalculator/lib'

export function parseInputSentences(body: unknown): InputSentences {
  const parsedInput = inputSentencesSchema.parse(body)
  const { remandAdjustment } = parsedInput

  if (!remandAdjustment) {
    return parsedInput
  }

  const sentenceStart = parsedInput.inputIndividualSentences[0].from

  // for remand with no start date extract the start date
  if (!remandAdjustment.startDate) {
    return {
      ...parsedInput,
      remandAdjustment: {
        ...remandAdjustment,
        startDate: calculateAdjustmentStart(sentenceStart, remandAdjustment.days!),
      },
    }
  }

  // for remand with start day only calculate the number of remand days
  if (!remandAdjustment.days) {
    return {
      ...parsedInput,
      remandAdjustment: {
        ...remandAdjustment,
        days: calculateRemandDays(sentenceStart, remandAdjustment.startDate),
      },
    }
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

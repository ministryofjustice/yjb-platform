import { inputSentencesSchema, InputSentences, OutputCalculation } from '@yjb-platform/shared-types'

export function parseInputSentences(body: unknown): InputSentences {
  return inputSentencesSchema.parse(body)
}

function dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key]
  return raw instanceof Date ? raw.toISOString().slice(0, 10) : value
}

export function formatOutputCalculation(outputCalc: OutputCalculation): string {
  return JSON.stringify(outputCalc, dateOnlyReplacer)
}

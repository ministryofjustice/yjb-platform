import { OutputCalculation } from '@yjb-platform/shared-types'
import { toIsoDateString } from '../services/sentenceCalculator/helpers/dateObjects'

function dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key]
  return raw instanceof Date ? toIsoDateString(raw) : value
}

export default function formatOutputCalculation(outputCalc: OutputCalculation): string {
  return JSON.stringify(outputCalc, dateOnlyReplacer)
}

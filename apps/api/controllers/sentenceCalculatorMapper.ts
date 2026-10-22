import { OutputCalculation, toDateString } from '@yjb-platform/shared-types'

function dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key]
  return raw instanceof Date ? toDateString(raw) : value
}

export default function formatOutputCalculation(outputCalc: OutputCalculation): string {
  return JSON.stringify(outputCalc, dateOnlyReplacer)
}

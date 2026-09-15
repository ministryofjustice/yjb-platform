import { z } from 'zod'
import { AdjustmentTypes, InputSentences, OutputCalculation } from '../services/sentenceCalculator/types'

const inputIndividualSentenceSchema = z.object({
  from: z.coerce.date(),
  durationMonths: z.number(),
})

const remandAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.remand),
  days: z.number(),
  startDate: z.coerce.date(),
})

const taggedBailAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.taggedBail),
  days: z.number(),
})

const inputSentencesSchema = z.object({
  offenderName: z.string(),
  remandAdjustment: remandAdjustmentSchema.optional(),
  taggedBailAdjustment: taggedBailAdjustmentSchema.optional(),
  inputIndividualSentences: z.array(inputIndividualSentenceSchema).min(1),
})

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

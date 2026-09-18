import { z } from 'zod'
import { AdjustmentTypes } from './adjustment-types'

// input schemas - the single source of truth: both the runtime validation and the
// TypeScript types derived from these in index.ts, so they can never drift apart
export const inputIndividualSentenceSchema = z.object({
  from: z.coerce.date(),
  durationMonths: z.number(),
})

export const remandAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.remand),
  days: z.number(),
  startDate: z.coerce.date().optional(),
})

export const taggedBailAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.taggedBail),
  days: z.number(),
})

export const inputSentencesSchema = z.object({
  offenderName: z.string(),
  remandAdjustment: remandAdjustmentSchema.optional(),
  taggedBailAdjustment: taggedBailAdjustmentSchema.optional(),
  inputIndividualSentences: z.array(inputIndividualSentenceSchema).min(1),
})

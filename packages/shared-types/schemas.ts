import { z } from 'zod'
import { AdjustmentTypes } from './adjustment-types'

//indivudual schemas for reuse from front and backend
export const remandStartDateSchema = z.coerce.date().optional()
export const remandDaysSchema = z.number()
export const taggedBailDaysSchema = z.number()
export const sentenceFrom = z.coerce.date()
export const sentanceDurationMonths = z.number()
export const sentanceOffenderName = z.string()

//dto form schemas
export const dtoFormSchema = z.object({
  from: sentenceFrom,
  durationMonths: sentanceDurationMonths,
  remandDays: remandDaysSchema.optional,
  remandStartDate: remandStartDateSchema.optional,
  taggedBailDays: taggedBailDaysSchema.optional,
})

//input object schemas
export const inputIndividualSentenceSchema = z.object({
  from: sentenceFrom,
  durationMonths: sentanceDurationMonths,
})

export const remandAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.remand),
  days: remandDaysSchema,
  startDate: remandStartDateSchema,
})

export const taggedBailAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.taggedBail),
  days: taggedBailDaysSchema,
})

export const inputSentencesSchema = z.object({
  offenderName: sentanceOffenderName,
  remandAdjustment: remandAdjustmentSchema.optional(),
  taggedBailAdjustment: taggedBailAdjustmentSchema.optional(),
  inputIndividualSentences: z.array(inputIndividualSentenceSchema).min(1),
})


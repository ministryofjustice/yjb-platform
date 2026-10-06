import { z } from 'zod'
import { AdjustmentTypes } from './adjustment-types'

//indivudual schemas for reuse from front and backend
export const remandStartDateSchema = z.coerce.date().optional()
export const remandDaysSchema = z.number()
export const taggedBailDaysSchema = z.number()
export const sentenceFrom = z.coerce.date()
export const sentanceDurationMonths = z.number()
export const sentanceOffenderName = z.string()
export const sentenceDateStringSchema = z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/)

//dto form schemas
// the HTML form always submits strings (even for number-shaped fields), unlike the
// JSON API payload, so these coerce first and then re-validate against the same
// rule the API uses - the API's own schemas below stay strict, uncoerced
export const dtoFormSchema = z.object({
  from: sentenceFrom.catch(new Date(NaN)),
  durationMonths: z.coerce.number().pipe(sentanceDurationMonths).default(0),
  remandDays: z.coerce.number().pipe(remandDaysSchema).default(0),
  remandStartDate: remandStartDateSchema,
  taggedBailDays: z.coerce.number().pipe(taggedBailDaysSchema).default(0),
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


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

// the GOV.UK date input submits day/month/year as three separate fields - these
// only check each part's own range independently (e.g. day <= 31 regardless of
// month), not whether the combination is a real calendar date (e.g. 31 February)
export const sentenceDateDaySchema = z.coerce.number({ error: 'Please provide a valid day' }).int().min(1).max(31)
export const sentenceDateMonthSchema = z.coerce.number({ error: 'Please provide a valid month' }).int().min(1).max(12)
export const sentenceDateYearSchema = z.coerce
  .number({ error: 'Please provide a valid year' })
  .int()
  .min(1900)
  .max(2100)

//dto form schemas
// the HTML form always submits strings (even for number-shaped fields), unlike the
// JSON API payload, so these coerce first and then re-validate against the same
// rule the API uses - the API's own schemas below stay strict, uncoerced
export const dtoFormSchema = z.object({
  from: sentenceFrom.catch(new Date(NaN)),
  durationMonths: z.coerce
    .number({ error: 'Please provide a valid sentence duration' })
    .pipe(sentanceDurationMonths)
,
  remandDays: z.coerce.number({ error: 'Please provide a valid number of days spend on remand' }).pipe(remandDaysSchema),
  remandStartDate: remandStartDateSchema,
  taggedBailDays: z.coerce
    .number({ error: 'Please provide a valid number of tagged bail days' })
    .pipe(taggedBailDaysSchema),
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


import { z } from 'zod'

// internal types
export const AdjustmentTypes = {
  remand: 'remand',
  taggedBail: 'taggedBail',
} as const

export type AdjustmentTypes = (typeof AdjustmentTypes)[keyof typeof AdjustmentTypes]

// input schemas - the single source of truth: both the runtime validation and the
// TypeScript types below are derived from these, so they can never drift apart
export const inputIndividualSentenceSchema = z.object({
  from: z.coerce.date(),
  durationMonths: z.number(),
})

export const remandAdjustmentSchema = z.object({
  name: z.literal(AdjustmentTypes.remand),
  days: z.number(),
  startDate: z.coerce.date(),
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

// input types, inferred from the schemas above
export type InputIndividualSentence = z.infer<typeof inputIndividualSentenceSchema>
export type RemandAdjustment = z.infer<typeof remandAdjustmentSchema>
export type TaggedBailAdjustment = z.infer<typeof taggedBailAdjustmentSchema>
export type InputAdjustment = RemandAdjustment | TaggedBailAdjustment
export type InputSentences = z.infer<typeof inputSentencesSchema>

// output types - produced internally from validated input, never parsed from
// untrusted data, so there's no schema for these, only plain types
export interface OutputCalculation {
  calculatedTerms: AppendOnlyArray<CalculatedTerm>
  effectiveDates: EffectiveDates
  effectiveDatesPastAdjustments: AppendOnlyArray<RecordOfAdjustment>
  ltd: Date | 0
  etd: Date | 0
  unusedAdjustmentDays: number
}

export type EffectiveDates = {
  totalNumberOfRemandAndTaggedBailDays: number
  sled: Date
  mtd: Date
  TUSED: Date
}

// each term corresponds to one line on the sheet or one sentence
export type CalculatedTerm = {
  inputSentence: InputIndividualSentence
  totalDaysInTerm: number
  totalDaysMTD: number
  sled: Date
  mtd: Date
}

export type RecordOfAdjustment = {
  adjustmentReason: AdjustmentTypes
  adjustmentParameters: InputAdjustment
  pastEffectiveDates: EffectiveDates
}

export type AdjustmentResult = {
  newEffectiveDates: EffectiveDates
  newRecordOfAdjustment: RecordOfAdjustment
  unusedAdjustmentDays: number
}

// exposes only push/read access - no pop, splice, shift, sort, etc. -
// so array order (oldest first) can't be disturbed once a record is pushed
export type AppendOnlyArray<T> = {
  readonly length: number
  readonly [index: number]: T
  push(...items: T[]): number
  [Symbol.iterator](): IterableIterator<T>
}

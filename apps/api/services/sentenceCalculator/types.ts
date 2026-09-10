// input types
export type InputIndividualSentence = {
  from: Date
  durationMonths: number
}

export type InputSentences = {
  offenderName: string
  remandAdjustment?: RemandAdjustment
  taggedBailAdjustment?: TaggedBailAdjustment
  inputIndividualSentences: InputIndividualSentence[]
}

// common shape every adjustment shares
interface BaseAdjustment {
  name: AdjustmentTypes
  days: number
}

export interface RemandAdjustment extends BaseAdjustment {
  name: typeof AdjustmentTypes.remand
  startDate: Date
}

export interface TaggedBailAdjustment extends BaseAdjustment {
  name: typeof AdjustmentTypes.taggedBail
  // no startDate — and TS will error if you try to read one
}

export type InputAdjustment = RemandAdjustment | TaggedBailAdjustment

// output types
export interface OutputCalculation {
  calculatedTerms: AppendOnlyArray<CalculatedTerm>
  effectiveDates: EffectiveDates
  effectiveDatesPastAdjustments: AppendOnlyArray<RecordOfAdjustment>
  ltd: Date | 0
  etd: Date | 0
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
}

// internal types
export const AdjustmentTypes = {
  remand: 'remand',
  taggedBail: 'taggedBail',
} as const

export type AdjustmentTypes = (typeof AdjustmentTypes)[keyof typeof AdjustmentTypes]

// exposes only push/read access - no pop, splice, shift, sort, etc. -
// so array order (oldest first) can't be disturbed once a record is pushed
export type AppendOnlyArray<T> = {
  readonly length: number
  readonly [index: number]: T
  push(...items: T[]): number
  [Symbol.iterator](): IterableIterator<T>
}

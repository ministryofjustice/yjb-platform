// input types
export type InputIndividualSentence = {
  from: Date
  durationMonths: number
}

export type InputSentences = {
  offenderName: string,
  remandAdjustment?: RemandAdjustment,
  taggedBailAdjustment?: TaggedBailAdjustment,
  inputIndividualSentences: InputIndividualSentence[]
}

// common shape every adjustment shares
interface BaseAdjustment {
  name: AdjustmentTypes
  days: number
}

interface RemandAdjustment extends BaseAdjustment {
  name: typeof AdjustmentTypes.remand
  startDate: Date
}

interface TaggedBailAdjustment extends BaseAdjustment {
  name: typeof AdjustmentTypes.taggedBail
  // no startDate — and TS will error if you try to read one
}

export type InputAdjustment = RemandAdjustment | TaggedBailAdjustment

// output types
export interface OutputCalculation {
  caluclatedTerms: AppendOnlyArray<CalculatedTerm>, //typo
  effectiveDates: EffectiveDates,
  effectiveDatesPastAdjustments: AppendOnlyArray<effectiveDatesPastAdjustments>
  ltd: Date; 
  etd: Date 
}

export type EffectiveDates = { 
  totalNumberOfRemandAndTaggedBailDays: number,
  sled: Date,
  mtd: Date,
  TUSED: Date
}

//each term corresponds to one line on the sheet or one sentence
export type CalculatedTerm = {
  inputSentece: InputIndividualSentence
  totalDaysInTerm: number
  totalDaysMTD: number
  sled: Date,
  mtd: Date
}

export type effectiveDatesPastAdjustments = {
  adjustmentReason: AdjustmentTypes,
  adjustmentParameters: InputAdjustment,
  pastEffectiveDates: EffectiveDates
}

// internal types
export const AdjustmentTypes = {
  remand: 'remand',
  taggedBail: 'taggedBail',
} as const

// logic only exists for `remand` for now; `taggedBail` is a no-op
export type AdjustmentTypes = (typeof AdjustmentTypes)[keyof typeof AdjustmentTypes]

// exposes only push/read access - no pop, splice, shift, sort, etc. -
// so array order (oldest first) can't be disturbed once a record is pushed
export type AppendOnlyArray<T> = {
  readonly length: number
  readonly [index: number]: T
  push(...items: T[]): number
  [Symbol.iterator](): IterableIterator<T>
}


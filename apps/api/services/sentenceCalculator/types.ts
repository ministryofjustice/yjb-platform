// input types
export type InputIndividualSentence = {
  from: Date
  durationMonths: number
}

export type InputSentences = {
  offenderName: string
  inputAdjustments: InputAdjustments,
  inputIndividualSentences: InputIndividualSentence[]
}

export type InputAdjustments = {
  remand: number
  remandStartDate: Date, 
  taggedBailDays: Number,
}

// output types
export interface OutputCalculation {
  caluclatedTerms: AppendOnlyArray<CalculatedTerm>,
  effectiveDates: { sled: Date; mtd: Date; ltd: Date; etd: Date }
  pastCalculations: AppendOnlyArray<PastCalculations>
}

//each term corresponds to one line on the sheet or one sentence
export type CalculatedTerm = {
  inputSentece: InputIndividualSentence
  totalDaysInTerm: number
  totalDaysMTD: number
  sled: Date,
  mtd: Date
}

export type PastCalculations = {
  adjustmentReason: AdjustmentTypes,
  oldSled: Date
  oldMtd: Date
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


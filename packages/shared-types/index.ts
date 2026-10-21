import { exactOptional } from 'zod'
import { AdjustmentTypes } from './adjustment-types'
import { transferDatesObj } from './dto-eligibility-status'
import { finalDatesObj } from './final-dates-status'

export { AdjustmentTypes }
export * from './dto-eligibility-status'
export * from './final-dates-status'
export * from './dateUtils'
export * from './textUtils'

// input types
export type InputIndividualSentence = {
  from: Date
  durationMonths: number
}

export type InputSentences = {
  offenderName: string
  remandAdjustment?: RemandAdjustment
  taggedBailAdjustment?: TaggedBailAdjustment
  erdEligible: boolean
  inputIndividualSentences: InputIndividualSentence[]
}

// remand is sent as its start date only - the API works out the days on remand from the sentence date
export interface RemandAdjustment {
  name: typeof AdjustmentTypes.remand
  startDate: Date
}

export interface TaggedBailAdjustment {
  name: typeof AdjustmentTypes.taggedBail
  days: number
}

export type InputAdjustment = RemandAdjustment | TaggedBailAdjustment

// output types
export interface OutputCalculation {
  calculatedTerms: AppendOnlyArray<CalculatedTerm>
  effectiveDates: EffectiveDates
  effectiveDatesPastAdjustments: AppendOnlyArray<RecordOfAdjustment>
  ltd: transferDatesObj
  etd: transferDatesObj
  unusedAdjustmentDays: number
  // days on remand, worked out from the remand start date (in effectiveDatesPastAdjustments) and the sentence date
  remandPeriodDays: number
}

export type EffectiveDates = {
  totalNumberOfRemandAndTaggedBailDays: number
  sled: finalDatesObj
  mtd: finalDatesObj
  TUSED: Date
}

export type termDatesObj = {
  data: Date
  metadata: {
    dayOfWeek: string
    message: string
  }
}

// each term corresponds to one line on the sheet or one sentence
export type CalculatedTerm = {
  inputSentence: InputIndividualSentence
  totalDaysInTerm: number
  totalDaysMTD: number
  sled: termDatesObj
  mtd: termDatesObj
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

// each row of the detailed breakdown is shown on two lines
export type calcBreakdown = {
  termLengthBreakdown: string,
  custodialPeriodBreakdown: string,
  remandPeriodBreakdown: string,
  mtdDate: string,
  mtdBreakdown: string,
  finalSledDate: string,
  finalSledBreakdown: string,
  finalMtdDate: string,
  finalMtdBreakdown: string,
  etdDate: string,
  etdBreakdown: string,
  ltdDate: string,
  ltdBreakdown: string
}

// zod schemas mirroring the input types above, for validating untrusted request
// bodies at the API boundary - see schemas.ts for the definitions
export * from './schemas'

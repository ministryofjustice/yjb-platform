// input type
export type InputIndividualSentence = {
  from: Date
  durationMonths: number
}

// input type
export type InputSentences = {
  offenderName: string
  remand: number
  remandStartDate: Date, 
  taggedBailDays: Number,
  inputIndividualSentences: InputIndividualSentence[]
}


// output type
export interface OutputCalculation {
  totalDaysInTerm: number
  totalDaysMTD: number
  effectiveDates: { sled: Date; mtd: Date; ltd: Date; etd: Date },
  pastCalculations: PastCalculations[]
}

// output type
export type PastCalculations = {
  adjustmentReason: AdjustmentTypes
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

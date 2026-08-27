// input type
export type Term = {
  from: Date
  durationMonths: number
  remand: number
}

// input type
export type Sentence = {
  offenderName: string,
  term: Term[]
}

// output type
export interface Calculation {
  totalDaysInTerm: number
  sledDate: Date
  totalDaysMTD: number
  mtdDate: Date
  adjustmentRecords: AdjustmentRecord[]
}

// output type
export type AdjustmentRecord = {
  type: Reason
  sledDate: Date
  mtdDate: Date
}


// internal types
export const Reason = {
  remand: 'remand',
  taggedBail: 'taggedBail',
} as const

// logic only exists for `remand` for now; `taggedBail` is a no-op
export type Reason = (typeof Reason)[keyof typeof Reason]

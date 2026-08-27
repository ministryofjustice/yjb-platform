//input type
export type Term = {
  from: Date
  durationMonths: number
  offenderName: string
  remand: number
}

//input type
export type Sentence = {
  term: Term[]
}

//output type
export interface Calculation {
  totalDaysInTerm: number
  sledDate: Date
  totalDaysMTD: number
  mtdDate: Date
  adjustments: Adjustment[]
}

//output type
export type Adjustment = {
  type: string
  sledDate: Date
  mtdDate: Date
}

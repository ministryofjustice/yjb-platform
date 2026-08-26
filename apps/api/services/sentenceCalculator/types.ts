export type Term = {
  from: Date
  durationMonths: number
  offenderName: string
  remand: number
}

export type Sentence = {
  term: Term[]
}

export interface Calculation {
  totalDaysInTerm: number
  sledDate: Date
  totalDaysMTD: number
  mtdDate: Date
}

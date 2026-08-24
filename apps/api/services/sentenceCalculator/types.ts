export type Term = {
  from: Date
  duration: string
  offenderName: string
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

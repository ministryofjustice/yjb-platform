// input type
export type Term = {
  from: Date
  durationMonths: number
  remand: number
}

// input type
export type Sentence = {
  offenderName: string
  term: Term[]
}

// output type
export interface Calculation {
  totalDaysInTerm: number
  effectiveSled: Date
  totalDaysMTD: number
  effectiveMTD: Date,
  effectiveLTD:  Date,
  effectiveETD:  Date,
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





// sentence[
//   s1: months, start Date, end date, days, sled, mtdDays, mtd
// ]: 

// adjustment[
//   remandAdjustment: remandStart, remandEnd, => remandDays
//   taggedBailAdjustment: => taggedBailDays
// ]

// effectiveDates = (sentence + remandAdjustment + taggedBailAdjustment) => totalDaysAdjustment, effectiveSled, effectiveMTD

// sheetFront: effectiveDates => add ETD, LTD

// const calculationResult = {
//   effectiveDates: {
//     effectiveSled
//     effectiveEtd,
//     effectiveMtd,
//     effectiveLtd
//   },
//   sentences[]:
//   adjustments[
//     {
//       type: 'remand',
//       startDate: 'jan01',
//       endDate: can be null,
//       appliesTo: [
//         s1, s3
//       ]
//     },
//   ]
// }
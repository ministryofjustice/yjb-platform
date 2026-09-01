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
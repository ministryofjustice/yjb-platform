export const AdjustmentTypes = {
  remand: 'remand',
  taggedBail: 'taggedBail',
} as const

export type AdjustmentTypes = (typeof AdjustmentTypes)[keyof typeof AdjustmentTypes]

export const AppliedAdjustmentStatus = {
  not_applied: 'no-adjustments-applied',
  applied: 'applied',
  collapsed: 'collapsed',
  collapsedUnused: 'collapsed-unused',
} as const

export type AppliedAdjustmentStatus = (typeof AppliedAdjustmentStatus)[keyof typeof AppliedAdjustmentStatus]

export type finalDatesObj = {
  data: Date
  metadata: {
    dayOfWeek: string
    status: AppliedAdjustmentStatus
    message: string
  }
}

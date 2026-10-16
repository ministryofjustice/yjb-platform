export const DtoEligibilityStatus = {
  notCalculated: 'not_calculated',
  oneMonth: '1_month',
  twoMonths: '2_months',
} as const

export type DtoEligibilityStatus = (typeof DtoEligibilityStatus)[keyof typeof DtoEligibilityStatus]

export type transferDatesObj = {
  data: Date | 0
  metadata: {
    dayOfWeek?: string
    status: DtoEligibilityStatus
    message: string
  }
}

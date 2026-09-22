export const DtoEligibilityStatus = {
  notCalculated: 'not_calculated',
  oneMonth: '1_month',
  twoMonths: '2_months',
} as const

export type DtoEligibilityStatus = (typeof DtoEligibilityStatus)[keyof typeof DtoEligibilityStatus]

export const DTO_ELIGIBILITY_MESSAGES: Record<DtoEligibilityStatus, string> = {
  [DtoEligibilityStatus.notCalculated]: 'Not applicable for DTOs with terms less than 8 months',
  [DtoEligibilityStatus.oneMonth]: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
  [DtoEligibilityStatus.twoMonths]: '2 months away from the MTD for DTOs with terms over 18 months',
}

export type transferDatesObj = {
  data: Date | 0
  metadata: {
    status: DtoEligibilityStatus
    message: string
  }
}

export function buildTransferDatesObj(status: DtoEligibilityStatus, data: Date | 0): transferDatesObj {
  return {
    data,
    metadata: {
      status,
      message: DTO_ELIGIBILITY_MESSAGES[status],
    },
  }
}

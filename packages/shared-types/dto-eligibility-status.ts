export const DtoEligibilityStatus = {
  notCalculated: 'not_calculated',
  oneMonth: '1_month',
  twoMonths: '2_months',
} as const

export type DtoEligibilityStatus = (typeof DtoEligibilityStatus)[keyof typeof DtoEligibilityStatus]

export const DTO_ELIGIBILITY_MESSAGES: Record<DtoEligibilityStatus, string> = {
  [DtoEligibilityStatus.notCalculated]: 'Not applicable for DTOs of less then 8 months',
  [DtoEligibilityStatus.oneMonth]: '1 month away from the MTD for DTOs of 8 months up to 18 months',
  [DtoEligibilityStatus.twoMonths]: '2 months away from the MTD for DTOs of 18 months or more',
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

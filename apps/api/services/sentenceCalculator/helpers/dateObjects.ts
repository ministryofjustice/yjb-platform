import {
  AppliedAdjustmentStatus,
  DtoEligibilityStatus,
  finalDatesObj,
  termDatesObj,
  transferDatesObj,
} from '@yjb-platform/shared-types'

export const DTO_ELIGIBILITY_MESSAGES: Record<DtoEligibilityStatus, string> = {
  [DtoEligibilityStatus.notCalculated]: 'Not applicable for DTOs with terms less than 8 months',
  [DtoEligibilityStatus.oneMonth]: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
  [DtoEligibilityStatus.twoMonths]: '2 months away from the MTD for DTOs with terms over 18 months',
}

export const FINAL_SLED_BREAKDOWN_MESSAGE: Record<AppliedAdjustmentStatus, string> = {
  [AppliedAdjustmentStatus.not_applied]: ' No adjustments applied',
  [AppliedAdjustmentStatus.applied]: '{0} minus {1} days',
  [AppliedAdjustmentStatus.collapsed]:
    'Date was collapsed to sentence date, due to remand/tagged bail bigger then sentence period',
  [AppliedAdjustmentStatus.collapsedUnused]: 'Date was collapsed to sentence date, with {0} unused days ',
}

function format(template: string, ...args: Array<string | number>): string {
  return template.replace(/\{(\d+)\}/g, (_, index) => String(args[Number(index)] ?? ''))
}

// timeZone UTC as dates are built with Date.UTC, so local time can't shift the day
function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
}

export function buildTransferDatesObj(status: DtoEligibilityStatus, data: Date | 0): transferDatesObj {
  const res: transferDatesObj = {
    data,
    metadata: {
      status,
      message: DTO_ELIGIBILITY_MESSAGES[status],
    },
  }
  if (status !== DtoEligibilityStatus.notCalculated && data instanceof Date) {
    res.metadata.dayOfWeek = getDayOfWeek(data)
  }
  return res
}

export function buildfinalDatesObj(
  status: AppliedAdjustmentStatus,
  data: Date,
  initialDate?: undefined | Date,
  adjustmentDuration?: undefined | number,
  unusedDays?: undefined | number,
): finalDatesObj {
  let message = FINAL_SLED_BREAKDOWN_MESSAGE[status]

  if (status === AppliedAdjustmentStatus.applied && initialDate && adjustmentDuration) {
    const sentenceStartStr = initialDate.toISOString().slice(0, 10)
    message = format(FINAL_SLED_BREAKDOWN_MESSAGE[status], sentenceStartStr, adjustmentDuration)
  } else if (status === AppliedAdjustmentStatus.collapsedUnused && unusedDays) {
    message = format(FINAL_SLED_BREAKDOWN_MESSAGE[status], unusedDays)
  }

  return {
    data,
    metadata: {
      dayOfWeek: getDayOfWeek(data),
      status,
      message,
    },
  }
}

export function buildTermDatesObj(data: Date, daysFromSentenceStart: number, sentenceStart: Date): termDatesObj {
  const sentenceStartStr = new Date(sentenceStart).toISOString().slice(0, 10)

  return {
    data,
    metadata: {
      dayOfWeek: getDayOfWeek(data),
      message: `${daysFromSentenceStart} days from the beginning of the sentence (${sentenceStartStr})`,
    },
  }
}

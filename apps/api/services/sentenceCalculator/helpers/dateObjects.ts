import {
  AppliedAdjustmentStatus,
  DtoEligibilityStatus,
  finalDatesObj,
  termDatesObj,
  transferDatesObj,
  formatUkDate,
  pluralise,
} from '@yjb-platform/shared-types'

export const DTO_ELIGIBILITY_MESSAGES: Record<DtoEligibilityStatus, string> = {
  [DtoEligibilityStatus.notCalculated]: 'Not applicable for DTOs with terms less than 8 months',
  [DtoEligibilityStatus.oneMonth]: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
  [DtoEligibilityStatus.twoMonths]: '2 months away from the MTD for DTOs with terms over 18 months',
  [DtoEligibilityStatus.notEligible]: 'Not eligible for early release',
}

export const FINAL_SLED_BREAKDOWN_MESSAGE: Record<AppliedAdjustmentStatus, string> = {
  [AppliedAdjustmentStatus.not_applied]: ' No adjustments applied',
  // number of days
  [AppliedAdjustmentStatus.applied]: '{0} minus {1}',
  [AppliedAdjustmentStatus.collapsed]:
    'Date was collapsed to sentence date, due to remand/tagged bail bigger then sentence period',
  //  number of unused days
  [AppliedAdjustmentStatus.collapsedUnused]: 'Date was collapsed to sentence date, with {0} ',
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
    const sentenceStartStr = formatUkDate(initialDate)
    message = format(FINAL_SLED_BREAKDOWN_MESSAGE[status], sentenceStartStr, pluralise(adjustmentDuration, 'day'))
  } else if (status === AppliedAdjustmentStatus.collapsedUnused && unusedDays) {
    message = format(FINAL_SLED_BREAKDOWN_MESSAGE[status], pluralise(unusedDays, 'unused day'))
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

export function buildTermDatesObj(
  data: Date,
  daysFromSentenceStart: number,
  sentenceStart: Date,
  addCustodialPeriod: boolean = false,
): termDatesObj {
  const sentenceStartStr = formatUkDate(new Date(sentenceStart))

  // the MTD is the end of the custodial period, so its message says so
  let custodialPeriod = ''
  if (addCustodialPeriod) {
    custodialPeriod = ' (custodial period)'
  }

  return {
    data,
    metadata: {
      dayOfWeek: getDayOfWeek(data),
      message: `${pluralise(daysFromSentenceStart, 'day')}${custodialPeriod} from the beginning of the sentence (${sentenceStartStr})`,
    },
  }
}

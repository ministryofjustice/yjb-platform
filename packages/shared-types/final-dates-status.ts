export const AppliedAdjustmentStatus = {
  not_applied: 'no-adjustments-applied',
  applied: 'applied',
  collapsed: 'collapsed',
  collapsedUnused: 'collapsed-unused',
} as const

export type AppliedAdjustmentStatus = (typeof AppliedAdjustmentStatus)[keyof typeof AppliedAdjustmentStatus]

export const FINAL_SLED_BREAKDOWN_MESSAGE: Record<AppliedAdjustmentStatus, string> = {
  [AppliedAdjustmentStatus.not_applied]: ' No adjustments applied',
  [AppliedAdjustmentStatus.applied]: '{0} minus {1} days',
  [AppliedAdjustmentStatus.collapsed]: 'Date was collapsed to sentence day, due to remand/tagged bail bigger then sentence period',
  [AppliedAdjustmentStatus.collapsedUnused]: 'Date was collapsed to sentence day, with {0} unused days '
}

export type finalDatesObj = {
  data: Date 
  metadata: {
    status: AppliedAdjustmentStatus
    message: string
  }
}

function format(template: string, ...args: Array<string | number>): string {
  return template.replace(/\{(\d+)\}/g, (_, index) => String(args[Number(index)] ?? ''))
}

export function buildfinalDatesObj(status: AppliedAdjustmentStatus, data: Date, initialDate?: undefined | Date, adjustmentDuration?:undefined | number, unusedDays?: undefined | number): finalDatesObj {
  let message = FINAL_SLED_BREAKDOWN_MESSAGE[status]

  if(status == AppliedAdjustmentStatus.applied && initialDate && adjustmentDuration){
    const sentenceStartStr = initialDate.toISOString().slice(0, 10);
    message =  format(FINAL_SLED_BREAKDOWN_MESSAGE[status], sentenceStartStr, adjustmentDuration)
  }else if(status == AppliedAdjustmentStatus.collapsedUnused && unusedDays){
    message =   format(FINAL_SLED_BREAKDOWN_MESSAGE[status],unusedDays)
  }

  return {
    data,
    metadata: {
      status,
      message: message,
    },
  }
}

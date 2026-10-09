import {
  OutputCalculation,
  DtoEligibilityStatus,
  AppliedAdjustmentStatus,
  calcBreakdown,
} from '@yjb-platform/shared-types'

export const sampleCalculationResult: OutputCalculation = {
  calculatedTerms: [
    {
      inputSentence: {
        from: new Date('2026-06-29'),
        durationMonths: 11,
      },
      totalDaysInTerm: 334,
      totalDaysMTD: 167,
      sled: {
        data: new Date('2027-05-28'),
        metadata: {
          dayOfWeek: 'Friday',
          message: '334 days from the beginning of the sentence (2026-06-29)',
        },
      },
      mtd: {
        data: new Date('2026-12-12'),
        metadata: {
          dayOfWeek: 'Saturday',
          message: '167 days from the beginning of the sentence (2026-06-29)',
        },
      },
    },
  ],
  effectiveDates: {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: {
      data: new Date('2027-05-13'),
      metadata: {
        dayOfWeek: 'Thursday',
        status: AppliedAdjustmentStatus.applied,
        message: '2027-05-28 minus 15 days',
      },
    },
    mtd: {
      data: new Date('2026-11-27'),
      metadata: {
        dayOfWeek: 'Friday',
        status: AppliedAdjustmentStatus.applied,
        message: '2026-12-12 minus 15 days',
      },
    },
    TUSED: new Date('1970-01-01'),
  },
  effectiveDatesPastAdjustments: [
    {
      adjustmentReason: 'remand',
      adjustmentParameters: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
        days: 15,
      },
      pastEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: {
          data: new Date('2027-05-28'),
          metadata: {
            dayOfWeek: 'Friday',
            status: AppliedAdjustmentStatus.not_applied,
            message: ' No adjustments applied',
          },
        },
        mtd: {
          data: new Date('2026-12-12'),
          metadata: {
            dayOfWeek: 'Saturday',
            status: AppliedAdjustmentStatus.not_applied,
            message: ' No adjustments applied',
          },
        },
        TUSED: new Date('1970-01-01'),
      },
    },
  ],
  ltd: {
    data: new Date('2026-12-27'),
    metadata: {
      dayOfWeek: 'Sunday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  etd: {
    data: new Date('2026-10-27'),
    metadata: {
      dayOfWeek: 'Tuesday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  unusedAdjustmentDays: 0,
}

export const termDates = {
  sled: 'Friday 2027-05-28',
  mtd: 'Saturday 2026-12-12',
}

export const resultDates = {
  sled: 'Thursday 2027-05-13',
  finalMtd: 'Friday 2026-11-27',
  etd: 'Tuesday 2026-10-27',
  ltd: 'Sunday 2026-12-27',
}

export const breakdownObj: calcBreakdown = {
  custodialPeriodBreakdown: '(334 divided by 2)',
  remandPeriodBreakdown: '(14 June 2026 to 28 June 2026)',
  sledBreakdown: 'Thursday, 13 May 2027, 2027-05-28 minus 15 days',
  finalMtdBreakdown: 'Friday, 27 November 2026, 2026-12-12 minus 15 days',
  etdBreakdown: 'Tuesday, 27 October 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months',
  ltdBreakdown: 'Sunday, 27 December 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months',
}

export const sampleCalculationResult2: OutputCalculation = {
  calculatedTerms: [
    {
      inputSentence: {
        from: new Date('2026-06-28'),
        durationMonths: 11,
      },
      totalDaysInTerm: 333,
      totalDaysMTD: 167,
      sled: {
        data: new Date('2027-05-27'),
        metadata: {
          dayOfWeek: 'Thursday',
          message: '333 days from the beginning of the sentence (2026-06-28)',
        },
      },
      mtd: {
        data: new Date('2026-12-11'),
        metadata: {
          dayOfWeek: 'Friday',
          message: '167 days from the beginning of the sentence (2026-06-28)',
        },
      },
    },
  ],
  effectiveDates: {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: {
      data: new Date('2027-05-12'),
      metadata: {
        dayOfWeek: 'Wednesday',
        status: AppliedAdjustmentStatus.applied,
        message: '2027-05-27 minus 15 days',
      },
    },
    mtd: {
      data: new Date('2026-11-26'),
      metadata: {
        dayOfWeek: 'Thursday',
        status: AppliedAdjustmentStatus.applied,
        message: '2026-12-11 minus 15 days',
      },
    },
    TUSED: new Date('1970-01-01'),
  },
  effectiveDatesPastAdjustments: [
    {
      adjustmentReason: 'remand',
      adjustmentParameters: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
        days: 15,
      },
      pastEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: {
          data: new Date('2027-05-27'),
          metadata: {
            dayOfWeek: 'Thursday',
            status: AppliedAdjustmentStatus.not_applied,
            message: ' No adjustments applied',
          },
        },
        mtd: {
          data: new Date('2026-12-11'),
          metadata: {
            dayOfWeek: 'Friday',
            status: AppliedAdjustmentStatus.not_applied,
            message: ' No adjustments applied',
          },
        },
        TUSED: new Date('1970-01-01'),
      },
    },
  ],
  ltd: {
    data: new Date('2026-12-26'),
    metadata: {
      dayOfWeek: 'Saturday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  etd: {
    data: new Date('2026-10-26'),
    metadata: {
      dayOfWeek: 'Monday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  unusedAdjustmentDays: 0,
}

export const breakdownObj2: Record<string, string> = {
  custodialPeriodBreakdown: '(333 divided by 2, rounded up)',
}

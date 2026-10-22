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
          message: '334 days from the beginning of the sentence (29 June 2026)',
        },
      },
      mtd: {
        data: new Date('2026-12-12'),
        metadata: {
          dayOfWeek: 'Saturday',
          message: '167 days (custodial period) from the beginning of the sentence (29 June 2026)',
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
        message: '28 May 2027 minus 15 days',
      },
    },
    mtd: {
      data: new Date('2026-11-27'),
      metadata: {
        dayOfWeek: 'Friday',
        status: AppliedAdjustmentStatus.applied,
        message: '12 December 2026 minus 15 days',
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
  erd: {
    data: new Date('2026-10-27'),
    metadata: {
      dayOfWeek: 'Tuesday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  unusedAdjustmentDays: 0,
  remandPeriodDays: 15,
}

export const termDates = {
  sled: 'Friday 2027-05-28',
  mtd: 'Saturday 2026-12-12',
}

export const periods = {
  termLength: '11 months (334 days)',
  custodialPeriod: '167 days',
  remandPeriod: '15 days',
}

export const resultDates = {
  finalSled: 'Thursday 2027-05-13',
  finalMtd: 'Friday 2026-11-27',
  etd: 'Tuesday 2026-10-27',
  ltd: 'Sunday 2026-12-27',
  erd: 'Tuesday 2026-10-27',
}

export const breakdownObj: calcBreakdown = {
  termLengthBreakdown: 'from 29 June 2026 to 13 May 2027',
  custodialPeriodBreakdown: 'Term length (334) / 2',
  remandPeriodBreakdown: '14 June 2026 to 28 June 2026',
  mtdDate: 'Saturday, 12 December 2026',
  mtdBreakdown: '167 days (custodial period) from the beginning of the sentence (29 June 2026)',
  finalSledDate: 'Thursday, 13 May 2027',
  finalSledBreakdown: '28 May 2027 minus 15 days',
  finalMtdDate: 'Friday, 27 November 2026',
  finalMtdBreakdown: '12 December 2026 minus 15 days',
  etdDate: 'Tuesday, 27 October 2026',
  etdBreakdown: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
  ltdDate: 'Sunday, 27 December 2026',
  ltdBreakdown: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
  erdDate: 'Tuesday, 27 October 2026',
  erdBreakdown: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
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
          message: '333 days from the beginning of the sentence (28 June 2026)',
        },
      },
      mtd: {
        data: new Date('2026-12-11'),
        metadata: {
          dayOfWeek: 'Friday',
          message: '167 days (custodial period) from the beginning of the sentence (28 June 2026)',
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
        message: '27 May 2027 minus 15 days',
      },
    },
    mtd: {
      data: new Date('2026-11-26'),
      metadata: {
        dayOfWeek: 'Thursday',
        status: AppliedAdjustmentStatus.applied,
        message: '11 December 2026 minus 15 days',
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
  erd: {
    data: new Date('2026-10-26'),
    metadata: {
      dayOfWeek: 'Monday',
      status: DtoEligibilityStatus.oneMonth,
      message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
    },
  },
  unusedAdjustmentDays: 0,
  remandPeriodDays: 15,
}

export const breakdownObj2: Record<string, string> = {
  custodialPeriodBreakdown: 'Term length (333) / 2 and rounded up',
}

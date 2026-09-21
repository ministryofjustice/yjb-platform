import {
  OutputCalculation,
  DtoEligibilityStatus,
  DTO_ELIGIBILITY_MESSAGES,
  AppliedAdjustmentStatus,
  buildfinalDatesObj,
} from '@yjb-platform/shared-types'

const sampleCalculationResult: OutputCalculation = {
  calculatedTerms: [
    {
      inputSentence: {
        from: new Date('2026-06-29'),
        durationMonths: 11,
      },
      totalDaysInTerm: 334,
      totalDaysMTD: 167,
      sled: new Date('2027-05-28'),
      mtd: new Date('2026-12-12'),
    },
  ],
  effectiveDates: {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
    mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
        TUSED: new Date('1970-01-01'),
      },
    },
  ],
  ltd: {
    data: new Date('2026-12-27'),
    metadata: {
      status: DtoEligibilityStatus.oneMonth,
      message: DTO_ELIGIBILITY_MESSAGES['1_month'],
    },
  },
  etd: {
    data: new Date('2026-10-27'),
    metadata: {
      status: DtoEligibilityStatus.oneMonth,
      message: DTO_ELIGIBILITY_MESSAGES['1_month'],
    },
  },
  unusedAdjustmentDays: 0,
}
export default sampleCalculationResult

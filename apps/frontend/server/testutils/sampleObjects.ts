import { OutputCalculation } from '../types/dtoTypes'

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
    sled: new Date('2027-05-13'),
    mtd: new Date('2026-11-27'),
    TUSED: new Date('1970-01-01'),
  },
  effectiveDatesPastAdjustments: [
    {
      adjustmentReason: 'remand',
      adjustmentParameters: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
        days: 0,
      },
      pastEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date('1970-01-01'),
      },
    },
  ],
  ltd: new Date('2026-12-27'),
  etd: new Date('2026-10-27'),
}
export default sampleCalculationResult

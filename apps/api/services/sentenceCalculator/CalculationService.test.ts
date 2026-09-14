import calculateDTOSentence from './CalculationService'
import { AdjustmentTypes, InputSentences, OutputCalculation } from './types'

const remandInput: InputSentences = {
  offenderName: 'Test Offender',
  remandAdjustment: {
    name: AdjustmentTypes.remand,
    days: 15,
    startDate: new Date('2026-06-14'),
  },
  inputIndividualSentences: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    },
  ],
}

const remandTaggedBailInput: InputSentences = {
  offenderName: 'Test Offender',
  taggedBailAdjustment: {
    name: AdjustmentTypes.taggedBail,
    days: 15,
  },
  inputIndividualSentences: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    },
  ],
}

const remandAndTaggedBailInput: InputSentences = {
  offenderName: 'Test Offender',
  remandAdjustment: {
    name: AdjustmentTypes.remand,
    days: 15,
    startDate: new Date('2026-06-14'),
  },
  taggedBailAdjustment: {
    name: AdjustmentTypes.taggedBail,
    days: 4,
  },
  inputIndividualSentences: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    },
  ],
}

describe('calculateDTOSentence', () => {
  it('returns full calculation for 11 months sentence starting on 2026-06-29 no adjustments', () => {
    const noRemandInput: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 0,
        startDate: new Date(),
      },
      taggedBailAdjustment: {
        name: AdjustmentTypes.taggedBail,
        days: 0,
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }

    const expectedNoRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }

    expect(calculateDTOSentence(noRemandInput)).toEqual(expectedNoRemandOutput)
  })

  it('returns full calculation for 11 months sentence starting on 2026-06-29 with 15 days remand', () => {
    const expectedRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: new Date('2027-05-13'),
        mtd: new Date('2026-11-27'),
        TUSED: new Date(0),
      },
      ltd: new Date('2026-12-27'),
      etd: new Date('2026-10-27'),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandInput.remandAdjustment!,
          remainingAdjustmentDays: undefined,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0)
          },
        },
      ],
    }

    expect(calculateDTOSentence(remandInput)).toEqual(expectedRemandOutput)
  })

  it('returns full calculation for 11 months sentence starting on 2026-06-29 with 15 days tagged bail', () => {
    const expectedTaggedBailOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: new Date('2027-05-13'),
        mtd: new Date('2026-11-27'),
        TUSED: new Date(0),
      },
      ltd: new Date('2026-12-27'),
      etd: new Date('2026-10-27'),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: remandTaggedBailInput.taggedBailAdjustment!,
          remainingAdjustmentDays: undefined,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    expect(calculateDTOSentence(remandTaggedBailInput)).toEqual(expectedTaggedBailOutput)
  })

  it('returns full calculation for 11 months sentence starting on 2026-06-29 with 15 days remand and 4 days tagged bail', () => {
    const expectedRemandAndTaggedBailOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: new Date('2027-05-28'),
          mtd: new Date('2026-12-12'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 19,
        sled: new Date('2027-05-09'),
        mtd: new Date('2026-11-23'),
        TUSED: new Date(0),
      },
      ltd: new Date('2026-12-23'),
      etd: new Date('2026-10-23'),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandAndTaggedBailInput.remandAdjustment!,
          remainingAdjustmentDays: undefined,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0),
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: remandAndTaggedBailInput.taggedBailAdjustment!,
          remainingAdjustmentDays: undefined,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 15,
            sled: new Date('2027-05-13'),
            mtd: new Date('2026-11-27'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    expect(calculateDTOSentence(remandAndTaggedBailInput)).toEqual(expectedRemandAndTaggedBailOutput)
  })
})

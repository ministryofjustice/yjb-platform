import { AdjustmentTypes, InputSentences, OutputCalculation } from '@yjb-platform/shared-types'
import calculateDTOSentence from './CalculationService'

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

function compareOutputCalculations(outputCalculation1: OutputCalculation, outputCalculation2: OutputCalculation) {
    expect(outputCalculation1.calculatedTerms).toEqual(outputCalculation2.calculatedTerms)
    expect(outputCalculation1.effectiveDates).toEqual(outputCalculation2.effectiveDates)
    expect(outputCalculation1.ltd).toEqual(outputCalculation2.ltd)
    expect(outputCalculation1.etd).toEqual(outputCalculation2.etd)
    expect(outputCalculation1.unusedAdjustmentDays).toEqual(outputCalculation2.unusedAdjustmentDays)
    expect(outputCalculation1.effectiveDatesPastAdjustments).toEqual(outputCalculation2.effectiveDatesPastAdjustments)
    expect(outputCalculation1).toEqual(outputCalculation2)
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
      unusedAdjustmentDays: 0,
    }

    const noRemandOutput: OutputCalculation = calculateDTOSentence(noRemandInput)
    compareOutputCalculations(noRemandOutput, expectedNoRemandOutput)
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
      unusedAdjustmentDays: 0,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(remandInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
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
      unusedAdjustmentDays: 0,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: remandTaggedBailInput.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const taggedBailOutput: OutputCalculation = calculateDTOSentence(remandTaggedBailInput)
    compareOutputCalculations(taggedBailOutput, expectedTaggedBailOutput)
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
      unusedAdjustmentDays: 0,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandAndTaggedBailInput.remandAdjustment!,
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
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 15,
            sled: new Date('2027-05-13'),
            mtd: new Date('2026-11-27'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandAndTaggedBailOutput: OutputCalculation = calculateDTOSentence(remandAndTaggedBailInput)
    compareOutputCalculations(remandAndTaggedBailOutput, expectedRemandAndTaggedBailOutput)
  })

  it('returns full calculation for 4 months sentence starting on 2026-06-01 with 50 days remand', () => {
    const fiftyDaysRemandInput: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 50, // smaller then mtd
        startDate: new Date('2026-04-12'), // 50 days prior sentence beginning
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-01'), // term ending Oct 1, 2026, Thursday prior adjustments
          durationMonths: 4, // sled 123 days and mtd 62 days
        },
      ],
    }

    const expectedRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-01'), durationMonths: 4 },
          totalDaysInTerm: 122,
          totalDaysMTD: 61,
          sled: new Date('2026-09-30'),
          mtd: new Date('2026-07-31'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 50,
        sled: new Date('2026-08-11'),
        mtd: new Date('2026-06-11'),
        TUSED: new Date(0),
      },
      ltd: 0, // this is zero as sentence is less then 8 months
      etd: 0, // this is zero as sentence is less then 8 months
      unusedAdjustmentDays: 0,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: fiftyDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2026-09-30'),
            mtd: new Date('2026-07-31'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(fiftyDaysRemandInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
  })

  // for testing purpose these examples have very big remands, since dto sentences are min of 4 months
  it('returns full calculation for 4 months sentence starting on 2026-06-01 with 70 days remand', () => {
    const seventyDaysRemandInput: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 70, // bigger than mtd but less than sled
        startDate: new Date('2026-03-23'), // 70 days prior to sentence beginning
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-01'), // term ending Oct 1, 2026, Thursday adjustments
          durationMonths: 4, // sled 123 days and mtd 62 days
        },
      ],
    }

    const expectedRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-01'), durationMonths: 4 },
          totalDaysInTerm: 122,
          totalDaysMTD: 61,
          sled: new Date('2026-09-30'),
          mtd: new Date('2026-07-31'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 70,
        sled: new Date('2026-07-22'),
        mtd: new Date('2026-06-01'),
        TUSED: new Date(0),
      },
      ltd: 0,
      etd: 0,
      unusedAdjustmentDays: 9,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: seventyDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2026-09-30'),
            mtd: new Date('2026-07-31'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(seventyDaysRemandInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
  })

  // for testing purpose these examples have very big remands, since dto sentences are min of 4 months
  it('returns full calculation for 4 months sentence starting on 2026-06-01 with 125 days remand', () => {
    const oneTwentyFiveDaysRemandInput: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 125, // bigger then mtd and seld
        startDate: new Date('2026-01-27'), // 125 days prior sentence beginning
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-01'), // term ending Oct 1, 2026, Thursday adjustments
          durationMonths: 4, // sled 123 days and mtd 62 days
        },
      ],
    }

    const expectedRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-01'), durationMonths: 4 },
          totalDaysInTerm: 122,
          totalDaysMTD: 61,
          sled: new Date('2026-09-30'),
          mtd: new Date('2026-07-31'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 125,
        sled: new Date('2026-06-01'),
        mtd: new Date('2026-06-01'),
        TUSED: new Date(0),
      },
      ltd: 0,
      etd: 0,
      unusedAdjustmentDays: 64,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: oneTwentyFiveDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2026-09-30'),
            mtd: new Date('2026-07-31'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(oneTwentyFiveDaysRemandInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
  })

  it('returns full calculation for 4 months sentence starting on 2026-06-01 with 50 days remand and 20 days tagged bail', () => {
    const fiftyRemandTwentyTaggedBailInput: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 50, // smaller then mtd
        startDate: new Date('2026-04-12'), // 50 days prior sentence beginning
      },
      taggedBailAdjustment: {
        name: AdjustmentTypes.taggedBail,
        days: 20, // but with this bigger then mtd
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-01'), // term ending Oct 1, 2026, Thursday prior adjustments
          durationMonths: 4, // sled 123 days and mtd 62 days
        },
      ],
    }

    const expectedRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-01'), durationMonths: 4 },
          totalDaysInTerm: 122,
          totalDaysMTD: 61,
          sled: new Date('2026-09-30'),
          mtd: new Date('2026-07-31'),
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 70,
        sled: new Date('2026-07-22'),
        mtd: new Date('2026-06-01'), // this has collapsed to sentence date after tagged bail takes us to date in the past
        TUSED: new Date(0),
      },
      ltd: 0,
      etd: 0,
      unusedAdjustmentDays: 9,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: fiftyRemandTwentyTaggedBailInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2026-09-30'),
            mtd: new Date('2026-07-31'),
            TUSED: new Date(0),
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: fiftyRemandTwentyTaggedBailInput.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 50,
            sled: new Date('2026-08-11'),
            mtd: new Date('2026-06-11'),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(fiftyRemandTwentyTaggedBailInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
  })
})

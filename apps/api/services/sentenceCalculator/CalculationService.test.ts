import {
  AdjustmentTypes,
  InputSentences,
  OutputCalculation,
  DtoEligibilityStatus,
  AppliedAdjustmentStatus,
} from '@yjb-platform/shared-types'
import { sampleInputSentences } from '../../testutils/sampleObjects'
import { buildTransferDatesObj, buildfinalDatesObj } from './helpers/dateObjects'
import calculateDTOSentence from './CalculationService'

const remandInput: InputSentences = {
  ...sampleInputSentences,
  remandAdjustment: {
    name: AdjustmentTypes.remand,
    startDate: new Date('2026-06-14'),
  },
}

const remandTaggedBailInput: InputSentences = {
  ...sampleInputSentences,
  taggedBailAdjustment: {
    name: AdjustmentTypes.taggedBail,
    days: 15,
  },
}

const remandAndTaggedBailInput: InputSentences = {
  ...sampleInputSentences,
  remandAdjustment: {
    name: AdjustmentTypes.remand,
    startDate: new Date('2026-06-14'),
  },
  taggedBailAdjustment: {
    name: AdjustmentTypes.taggedBail,
    days: 4,
  },
}

function compareOutputCalculations(outputCalculation1: OutputCalculation, outputCalculation2: OutputCalculation) {
  expect(outputCalculation1.calculatedTerms).toEqual(outputCalculation2.calculatedTerms)
  expect(outputCalculation1.effectiveDates).toEqual(outputCalculation2.effectiveDates)
  expect(outputCalculation1.ltd).toEqual(outputCalculation2.ltd)
  expect(outputCalculation1.etd).toEqual(outputCalculation2.etd)
  expect(outputCalculation1.erd).toEqual(outputCalculation2.erd)
  expect(outputCalculation1.unusedAdjustmentDays).toEqual(outputCalculation2.unusedAdjustmentDays)
  expect(outputCalculation1.effectiveDatesPastAdjustments).toEqual(outputCalculation2.effectiveDatesPastAdjustments)
  expect(outputCalculation1).toEqual(outputCalculation2)
}

describe('calculateDTOSentence', () => {
  it('returns full calculation for 11 months sentence starting on 2026-06-29 no adjustments', () => {
    const noRemandInput: InputSentences = {
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        // remand starting on the sentence date is 0 days, so no adjustment is applied
        startDate: new Date('2026-06-29'),
      },
      taggedBailAdjustment: {
        name: AdjustmentTypes.taggedBail,
        days: 0,
      },
    }

    const expectedNoRemandOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-29'), durationMonths: 11 },
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
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2027-01-12')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      effectiveDatesPastAdjustments: [],
      unusedAdjustmentDays: 0,
      remandPeriodDays: 0,
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
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-27')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 15,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
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
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-27')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 0,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: remandTaggedBailInput.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
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
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 19,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-09'), new Date('2027-05-28'), 19),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-23'), new Date('2026-12-12'), 19),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-23')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-23')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-23')),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 15,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: remandAndTaggedBailInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
            TUSED: new Date(0),
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: remandAndTaggedBailInput.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 15,
            sled: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2027-05-13'),
              new Date('2027-05-28'),
              15,
            ),
            mtd: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2026-11-27'),
              new Date('2026-12-12'),
              15,
            ),
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
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
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
          sled: {
            data: new Date('2026-09-30'),
            metadata: {
              dayOfWeek: 'Wednesday',
              message: '122 days from the beginning of the sentence (1 June 2026)',
            },
          },
          mtd: {
            data: new Date('2026-07-31'),
            metadata: {
              dayOfWeek: 'Friday',
              message: '61 days from the beginning of the sentence (1 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 50,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-08-11'), new Date('2026-09-30'), 50),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-06-11'), new Date('2026-07-31'), 50),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 50,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: fiftyDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-09-30')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-07-31')),
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
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
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
          sled: {
            data: new Date('2026-09-30'),
            metadata: {
              dayOfWeek: 'Wednesday',
              message: '122 days from the beginning of the sentence (1 June 2026)',
            },
          },
          mtd: {
            data: new Date('2026-07-31'),
            metadata: {
              dayOfWeek: 'Friday',
              message: '61 days from the beginning of the sentence (1 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 70,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-07-22'), new Date('2026-09-30'), 70),
        mtd: buildfinalDatesObj(
          AppliedAdjustmentStatus.collapsedUnused,
          new Date('2026-06-01'),
          undefined,
          undefined,
          9,
        ),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      unusedAdjustmentDays: 9,
      remandPeriodDays: 70,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: seventyDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-09-30')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-07-31')),
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
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
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
          sled: {
            data: new Date('2026-09-30'),
            metadata: {
              dayOfWeek: 'Wednesday',
              message: '122 days from the beginning of the sentence (1 June 2026)',
            },
          },
          mtd: {
            data: new Date('2026-07-31'),
            metadata: {
              dayOfWeek: 'Friday',
              message: '61 days from the beginning of the sentence (1 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 125,
        sled: buildfinalDatesObj(
          AppliedAdjustmentStatus.collapsedUnused,
          new Date('2026-06-01'),
          undefined,
          undefined,
          64,
        ),
        mtd: buildfinalDatesObj(
          AppliedAdjustmentStatus.collapsedUnused,
          new Date('2026-06-01'),
          undefined,
          undefined,
          64,
        ),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      unusedAdjustmentDays: 64,
      remandPeriodDays: 125,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: oneTwentyFiveDaysRemandInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-09-30')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-07-31')),
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
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
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
          sled: {
            data: new Date('2026-09-30'),
            metadata: {
              dayOfWeek: 'Wednesday',
              message: '122 days from the beginning of the sentence (1 June 2026)',
            },
          },
          mtd: {
            data: new Date('2026-07-31'),
            metadata: {
              dayOfWeek: 'Friday',
              message: '61 days from the beginning of the sentence (1 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 70,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-07-22'), new Date('2026-09-30'), 70),
        mtd: buildfinalDatesObj(
          AppliedAdjustmentStatus.collapsedUnused,
          new Date('2026-06-01'),
          undefined,
          undefined,
          9,
        ), // this has collapsed to sentence date after tagged bail takes us to date in the past
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      unusedAdjustmentDays: 9,
      remandPeriodDays: 50,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: fiftyRemandTwentyTaggedBailInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-09-30')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-07-31')),
            TUSED: new Date(0),
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: fiftyRemandTwentyTaggedBailInput.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 50,
            sled: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2026-08-11'),
              new Date('2026-09-30'),
              50,
            ),
            mtd: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2026-06-11'),
              new Date('2026-07-31'),
              50,
            ),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const remandOutput: OutputCalculation = calculateDTOSentence(fiftyRemandTwentyTaggedBailInput)
    compareOutputCalculations(remandOutput, expectedRemandOutput)
  })

  // a 9 month sentence would normally get an ETD and LTD, but once the MTD has
  // collapsed to the sentence date there's no MTD to count back or forward from
  it('returns full calculation for 9 months sentence starting on 2026-06-01 with 151 days remand collapsing the MTD', () => {
    const collapsedMtdInput: InputSentences = {
      ...sampleInputSentences,
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        startDate: new Date('2026-01-01'), // 151 days prior sentence beginning
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-01'),
          durationMonths: 9, // sled 273 days and mtd 137 days
        },
      ],
    }

    const expectedCollapsedMtdOutput: OutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: new Date('2026-06-01'), durationMonths: 9 },
          totalDaysInTerm: 273,
          totalDaysMTD: 137,
          sled: {
            data: new Date('2027-02-28'),
            metadata: {
              dayOfWeek: 'Sunday',
              message: '273 days from the beginning of the sentence (1 June 2026)',
            },
          },
          mtd: {
            data: new Date('2026-10-15'),
            metadata: {
              dayOfWeek: 'Thursday',
              message: '137 days from the beginning of the sentence (1 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 151,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-09-30'), new Date('2027-02-28'), 151),
        mtd: buildfinalDatesObj(
          AppliedAdjustmentStatus.collapsedUnused,
          new Date('2026-06-01'),
          undefined,
          undefined,
          14,
        ),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      etd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0),
      unusedAdjustmentDays: 14,
      remandPeriodDays: 151,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: collapsedMtdInput.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-02-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-10-15')),
            TUSED: new Date(0),
          },
        },
      ],
    }

    const collapsedMtdOutput: OutputCalculation = calculateDTOSentence(collapsedMtdInput)
    compareOutputCalculations(collapsedMtdOutput, expectedCollapsedMtdOutput)
  })

  describe('ERD', () => {
    const notEligibleErd = buildTransferDatesObj(DtoEligibilityStatus.notEligible, 0)

    it('returns the ETD as the ERD when the child is eligible for early release', () => {
      const output: OutputCalculation = calculateDTOSentence({ ...sampleInputSentences, erdEligible: true })

      expect(output.etd).toEqual(buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')))
      expect(output.erd).toEqual(output.etd)
    })

    it('returns an ETD, LTD and ERD for an 8 months sentence when the child is eligible', () => {
      const output: OutputCalculation = calculateDTOSentence({
        ...sampleInputSentences,
        inputIndividualSentences: [{ from: new Date('2026-06-29'), durationMonths: 8 }],
      })

      expect(output.ltd.metadata.status).toBe(DtoEligibilityStatus.oneMonth)
      expect(output.etd.metadata.status).toBe(DtoEligibilityStatus.oneMonth)
      expect(output.erd).toEqual(output.etd)
    })

    it('returns 0 and not calculated for the ETD, LTD and ERD for a 7 months sentence when the child is eligible', () => {
      const output: OutputCalculation = calculateDTOSentence({
        ...sampleInputSentences,
        inputIndividualSentences: [{ from: new Date('2026-06-29'), durationMonths: 7 }],
      })

      const notCalculated = buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0)
      expect(output.ltd).toEqual(notCalculated)
      expect(output.etd).toEqual(notCalculated)
      expect(output.erd).toEqual(notCalculated)
    })

    it('returns 0 and not eligible for the ERD, but still calculates the ETD, when the child is not eligible', () => {
      const output: OutputCalculation = calculateDTOSentence({ ...sampleInputSentences, erdEligible: false })

      expect(output.etd).toEqual(buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')))
      expect(output.erd).toEqual(notEligibleErd)
    })

    it('returns 0 and not eligible for the ERD after a 15 days remand when the child is not eligible', () => {
      const output: OutputCalculation = calculateDTOSentence({ ...remandInput, erdEligible: false })

      expect(output.etd).toEqual(buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')))
      expect(output.erd).toEqual(notEligibleErd)
    })

    it('returns 0 and not eligible for the ERD when the child is not eligible and the MTD has collapsed', () => {
      const output: OutputCalculation = calculateDTOSentence({
        ...sampleInputSentences,
        erdEligible: false,
        remandAdjustment: { name: AdjustmentTypes.remand, startDate: new Date('2026-01-01') },
        inputIndividualSentences: [{ from: new Date('2026-06-01'), durationMonths: 9 }],
      })

      expect(output.etd).toEqual(buildTransferDatesObj(DtoEligibilityStatus.notCalculated, 0))
      expect(output.erd).toEqual(notEligibleErd)
    })
  })
})

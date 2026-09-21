import {
  InputSentences,
  OutputCalculation,
  AdjustmentTypes,
  DtoEligibilityStatus,
  buildTransferDatesObj,
  buildfinalDatesObj,
  AppliedAdjustmentStatus,
} from '@yjb-platform/shared-types'
import SentenceCalculatorController from './sentenceCalculatorController'

let controller: SentenceCalculatorController

beforeEach(() => {
  controller = new SentenceCalculatorController()
})

describe('SentenceController', () => {
  it('returns 2027-05-28 sled and 2026-12-12 mtd for 11 month sentence starting on 026-06-29 with no remand', () => {
    const inputSentence: InputSentences = {
      offenderName: 'test Offender',
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }
    const expectedOutputCalculation: OutputCalculation = {
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2027-01-12')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      effectiveDatesPastAdjustments: [],
      unusedAdjustmentDays: 0,
    }
    const calculatedCalculationObj = controller.getCalculation(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })

  it('returns sled 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 15 days remand', () => {
    const inputSentence: InputSentences = {
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

    const expectedOutputCalculation: OutputCalculation = {
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-27')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: inputSentence.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
            TUSED: new Date(0),
          },
        },
      ],
      unusedAdjustmentDays: 0,
    }
    const calculatedCalculationObj = controller.getCalculation(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })

  it('returns sled 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 15 days tagged bail', () => {
    const inputSentence: InputSentences = {
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

    const expectedOutputCalculation: OutputCalculation = {
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-27')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: inputSentence.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
            TUSED: new Date(0),
          },
        },
      ],
      unusedAdjustmentDays: 0,
    }
    const calculatedCalculationObj = controller.getCalculation(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })

  it('returns sled 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 10 days of remand and 5 days tagged bail', () => {
    const inputSentence: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: AdjustmentTypes.remand,
        days: 10,
        startDate: new Date('2026-06-14'),
      },
      taggedBailAdjustment: {
        name: AdjustmentTypes.taggedBail,
        days: 5,
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }

    const expectedOutputCalculation: OutputCalculation = {
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2027-05-13'), new Date('2027-05-28'), 15),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.applied, new Date('2026-11-27'), new Date('2026-12-12'), 15),
        TUSED: new Date(0),
      },
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-12-27')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-10-27')),
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: inputSentence.remandAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
            mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
            TUSED: new Date(0),
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: inputSentence.taggedBailAdjustment!,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 10,
            sled: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2027-05-18'),
              new Date('2027-05-28'),
              10,
            ),
            mtd: buildfinalDatesObj(
              AppliedAdjustmentStatus.applied,
              new Date('2026-12-02'),
              new Date('2026-12-12'),
              10,
            ),
            TUSED: new Date(0),
          },
        },
      ],
      unusedAdjustmentDays: 0,
    }
    const calculatedCalculationObj = controller.getCalculation(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })
})

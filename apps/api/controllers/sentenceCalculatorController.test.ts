import { InputSentences, OutputCalculation, AdjustmentTypes } from '../services/sentenceCalculator/types'
import sentenceCalculatorController from './sentenceCalculatorController'

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
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date(0),
      },
      ltd: new Date('2027-01-12'),
      etd: new Date('2026-11-12'),
      effectiveDatesPastAdjustments: [],
    }
    const calculatedCalculationObj = sentenceCalculatorController(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })

  it('returns seld 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 15 days remand', () => {
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

    const expectedOutputCalculation = {
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
          adjustmentParameters: inputSentence.remandAdjustment,
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: new Date('2027-05-28'),
            mtd: new Date('2026-12-12'),
            TUSED: new Date(0),
          },
        },
      ],
    }
    const calculatedCalculationObj = sentenceCalculatorController(inputSentence)
    expect(calculatedCalculationObj).toEqual(expectedOutputCalculation)
  })
})

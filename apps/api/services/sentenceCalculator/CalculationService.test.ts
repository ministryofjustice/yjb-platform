import { calculateDTOSentence } from './CalculationService'
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
    it('returns full calculation for 11 months sentence starting on 2026-06-29 no adjustments', ()=>{
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

    // it returns full calculation for 11 months sentence starting on 2026-06-29 15 days remand
    // it returns full calculation for 11 months sentence starting on 2026-06-29 15 days Tagged Bail
    // it returns full calculation for 11 months sentence starting on 2026-06-29 15 days remand 4 tagged bail
})


import { ZodError } from 'zod'
import { AdjustmentTypes, OutputCalculation } from '@yjb-platform/shared-types'
import { parseInputSentences, formatOutputCalculation } from './sentenceCalculatorMapper'

describe('parseInputSentences', () => {
  it('deserializes date strings into Date objects', () => {
    const body = {
      offenderName: 'Test Offender',
      inputIndividualSentences: [{ from: '2026-06-29', durationMonths: 11 }],
    }

    const result = parseInputSentences(body)

    expect(result.inputIndividualSentences[0].from).toEqual(new Date('2026-06-29'))
  })

  it('deserializes an optional remandAdjustment', () => {
    const body = {
      offenderName: 'Test Offender',
      remandAdjustment: { name: AdjustmentTypes.remand, days: 15, startDate: '2026-06-14' },
      inputIndividualSentences: [{ from: '2026-06-29', durationMonths: 11 }],
    }

    const result = parseInputSentences(body)

    expect(result.remandAdjustment).toEqual({
      name: AdjustmentTypes.remand,
      days: 15,
      startDate: new Date('2026-06-14'),
    })
  })

  it('throws a ZodError when a required field is missing', () => {
    const body = {
      inputIndividualSentences: [{ from: '2026-06-29', durationMonths: 11 }],
    }

    expect(() => parseInputSentences(body)).toThrow(ZodError)
  })

  it('throws a ZodError when inputIndividualSentences is empty', () => {
    const body = {
      offenderName: 'Test Offender',
      inputIndividualSentences: [],
    }

    expect(() => parseInputSentences(body)).toThrow(ZodError)
  })
})

describe('formatOutputCalculation', () => {
  it('formats Date fields as date-only ISO strings', () => {
    const outputCalculation: OutputCalculation = {
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
      effectiveDatesPastAdjustments: [],
      ltd: {
        data: new Date('2027-01-12'),
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      etd: {
        data: new Date('2026-11-12'),
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      unusedAdjustmentDays: 0,
    }

    const result = JSON.parse(formatOutputCalculation(outputCalculation))

    expect(result.ltd.data).toBe('2027-01-12')
    expect(result.etd.data).toBe('2026-11-12')
    expect(result.effectiveDates.sled).toBe('2027-05-28')
    expect(result.calculatedTerms[0].sled).toBe('2027-05-28')
  })
})

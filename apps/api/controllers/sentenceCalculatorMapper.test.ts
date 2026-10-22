import { ZodError } from 'zod'
import {
  AdjustmentTypes,
  OutputCalculation,
  DtoEligibilityStatus,
  AppliedAdjustmentStatus,
  inputSentencesSchema,
} from '@yjb-platform/shared-types'
import { buildTransferDatesObj, buildfinalDatesObj } from '../services/sentenceCalculator/helpers/dateObjects'
import formatOutputCalculation from './sentenceCalculatorMapper'
import { sampleInputSentencesBody } from '../testutils/sampleObjects'

describe('inputSentencesSchema', () => {
  it('deserializes date strings into Date objects', () => {
    const body = sampleInputSentencesBody

    const result = inputSentencesSchema.parse(body)

    expect(result.inputIndividualSentences[0].from).toEqual(new Date('2026-06-29'))
  })

  it('deserializes an optional remandAdjustment with its start date', () => {
    const body = {
      ...sampleInputSentencesBody,
      remandAdjustment: { name: AdjustmentTypes.remand, startDate: '2026-06-14' },
    }

    const result = inputSentencesSchema.parse(body)

    expect(result.remandAdjustment).toEqual({
      name: AdjustmentTypes.remand,
      startDate: new Date('2026-06-14'),
    })
  })

  it.each([true, false])('accepts an erdEligible of %s and passes it through unchanged', erdEligible => {
    const result = inputSentencesSchema.parse({ ...sampleInputSentencesBody, erdEligible })

    expect(result.erdEligible).toBe(erdEligible)
  })

  it('throws a ZodError when erdEligible is missing', () => {
    const { erdEligible: _omitted, ...body } = sampleInputSentencesBody

    expect(() => inputSentencesSchema.parse(body)).toThrow(ZodError)
  })

  it.each(['true', 'false', 1])('throws a ZodError when erdEligible is %p rather than a boolean', erdEligible => {
    expect(() => inputSentencesSchema.parse({ ...sampleInputSentencesBody, erdEligible })).toThrow(ZodError)
  })

  it('throws a ZodError when a remandAdjustment has no start date', () => {
    const body = {
      offenderName: 'Test Offender',
      remandAdjustment: { name: AdjustmentTypes.remand },
      inputIndividualSentences: [{ from: '2026-06-29', durationMonths: 11 }],
    }

    expect(() => inputSentencesSchema.parse(body)).toThrow(ZodError)
  })

  it('throws a ZodError when a required field is missing', () => {
    const body = {
      inputIndividualSentences: [{ from: '2026-06-29', durationMonths: 11 }],
    }

    expect(() => inputSentencesSchema.parse(body)).toThrow(ZodError)
  })

  it('throws a ZodError when inputIndividualSentences is empty', () => {
    const body = {
      offenderName: 'Test Offender',
      inputIndividualSentences: [],
    }

    expect(() => inputSentencesSchema.parse(body)).toThrow(ZodError)
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
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
        TUSED: new Date(0),
      },
      effectiveDatesPastAdjustments: [],
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2027-01-12')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 0,
    }

    const result = JSON.parse(formatOutputCalculation(outputCalculation))

    expect(result.ltd.data).toBe('2027-01-12')
    expect(result.etd.data).toBe('2026-11-12')
    expect(result.erd.data).toBe('2026-11-12')
    expect(result.effectiveDates.sled.data).toBe('2027-05-28')
    expect(result.calculatedTerms[0].sled.data).toBe('2027-05-28')
  })

  it('leaves an ERD of 0 as 0 when the child is not eligible for early release', () => {
    const outputCalculation: OutputCalculation = {
      calculatedTerms: [],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2027-05-28')),
        mtd: buildfinalDatesObj(AppliedAdjustmentStatus.not_applied, new Date('2026-12-12')),
        TUSED: new Date(0),
      },
      effectiveDatesPastAdjustments: [],
      ltd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2027-01-12')),
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('2026-11-12')),
      erd: buildTransferDatesObj(DtoEligibilityStatus.notEligible, 0),
      unusedAdjustmentDays: 0,
      remandPeriodDays: 0,
    }

    const result = JSON.parse(formatOutputCalculation(outputCalculation))

    expect(result.erd).toEqual({
      data: 0,
      metadata: { status: 'not_eligible', message: 'Not eligible for early release' },
    })
  })
})

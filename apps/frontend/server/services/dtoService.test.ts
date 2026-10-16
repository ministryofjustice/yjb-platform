import { InputSentences, ValidationErrorMessages } from '@yjb-platform/shared-types'
import DtoService, { ParsedDtoForm } from './dtoService'
import YjbApiClient from '../data/yjbApi'

jest.mock('../data/yjbApi')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>

describe('DtoService', () => {
  let dtoService: DtoService

  beforeEach(() => {
    dtoService = new DtoService(yjbApiClient)
  })

  describe('validatePayload', () => {
    const exampleValidPayload: Record<string, unknown> = {
      'sentence-length-months': 4,
      'sentence-date-year': 1990,
      'sentence-date-month': 5,
      'sentence-date-day': 14,
    }

    it('should return isValid false when sentence length is not provided', () => {
      const result = dtoService.validatePayload({})
      expect(result.isValid).toBe(false)
    })

    it.each([0, -1, -12, 0.5, 11.5])('should return isValid false for sentence length %s', months => {
      const payload: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': months,
      }
      expect(dtoService.validatePayload(payload).isValid).toBe(false)
    })

    it.each([4, 6, 11, 24])('should return isValid true for sentence length %s', months => {
      const payload: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': months,
      }
      expect(dtoService.validatePayload(payload).isValid).toBe(true)
    })

    it('should return isValid false for a 1 month sentence, below the 4 month DTO minimum', () => {
      const payload: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': 1,
      }
      const result = dtoService.validatePayload(payload)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'sentence-length-months',
        message: ValidationErrorMessages.SentenceDurationOutOfRange,
      })
    })

    it('should return isValid false for a 25 month sentence, above the 24 month DTO maximum', () => {
      const payload: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': 25,
      }
      const result = dtoService.validatePayload(payload)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'sentence-length-months',
        message: ValidationErrorMessages.SentenceDurationOutOfRange,
      })
    })

    const exampleRemandStartDate: Record<string, unknown> = {
      'remand-start-date-day': 9,
      'remand-start-date-month': 5,
      'remand-start-date-year': 1990,
    }

    it('should return isValid false when the remand start date is not a valid date', () => {
      const result = dtoService.validatePayload({
        ...exampleValidPayload,
        ...exampleRemandStartDate,
        'remand-start-date-day': 'abc',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'remand-start-date-day',
        message: ValidationErrorMessages.InvalidDay,
      })
    })

    it('should treat a blank remand start date as no remand', () => {
      const result = dtoService.validatePayload({
        ...exampleValidPayload,
        'remand-start-date-day': '',
        'remand-start-date-month': '',
        'remand-start-date-year': '',
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.payload.remandAdjustment).toBeUndefined()
    })

    it('should require every part of the remand start date once any part is filled in', () => {
      const result = dtoService.validatePayload({
        ...exampleValidPayload,
        'remand-start-date-day': 9,
        'remand-start-date-month': '',
        'remand-start-date-year': '',
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual([
        { field: 'remand-start-date-month', message: ValidationErrorMessages.InvalidMonth },
        { field: 'remand-start-date-year', message: ValidationErrorMessages.InvalidYear },
      ])
    })

    it.each([
      ['on', 14],
      ['after', 20],
    ])('should return isValid false when the remand start date is %s the sentence date', (_when, day) => {
      const result = dtoService.validatePayload({
        ...exampleValidPayload,
        ...exampleRemandStartDate,
        'remand-start-date-day': day,
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'remand-start-date',
        message: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate,
      })
      expect(result.payload).toBeUndefined()
    })

    it('should return only correctly parsed fields', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        ...exampleRemandStartDate,
        'tagged-bail-days': 4,
      }

      const expectedParsedInput: ParsedDtoForm = {
        taggedBailDays: 4,
        sentenceLengthMonths: 4,
        sentenceDateDay: 14,
        sentenceDateMonth: 5,
        sentenceDateYear: 1990,
        sentenceDate: new Date(Date.UTC(1990, 4, 14)),
        sentenceDateString: '14/05/1990',
        remandStartDateDay: 9,
        remandStartDateMonth: 5,
        remandStartDateYear: 1990,
        remandStartDate: new Date(Date.UTC(1990, 4, 9)),
        remandStartDateString: '09/05/1990',
      }
      expect(dtoService.validatePayload(inputData).parsedInput).toEqual(expectedParsedInput)
    })

    it('should return a payload only when valid', () => {
      expect(dtoService.validatePayload({}).payload).toBeUndefined()
      expect(dtoService.validatePayload(exampleValidPayload).payload).toBeDefined()
    })

    it('should return the parsed form data as parsedInput, with only the fields that were submitted and valid', () => {
      const payload: Record<string, unknown> = {
        'sentence-length-months': 1,
        'sentence-date-year': 1990,
        'sentence-date-month': 5,
        'sentence-date-day': 14,
      }
      const expectedParsedInput: ParsedDtoForm = {
        sentenceLengthMonths: 1,
        sentenceDateDay: 14,
        sentenceDateMonth: 5,
        sentenceDateYear: 1990,
        sentenceDate: new Date(Date.UTC(1990, 4, 14)),
        sentenceDateString: '14/05/1990',
      }
      expect(dtoService.validatePayload(payload).parsedInput).toEqual(expectedParsedInput)
      // nothing submitted, parsedInput is still returned, just empty
      expect(dtoService.validatePayload({}).parsedInput).toEqual({})
    })

    it('should return the parsed form data as parsedInput for tagged bail 0 and no remand', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'tagged-bail-days': 0,
      }

      const expectedParsedInput: ParsedDtoForm = {
        sentenceLengthMonths: 4,
        sentenceDateDay: 14,
        sentenceDateMonth: 5,
        sentenceDateYear: 1990,
        sentenceDate: new Date(Date.UTC(1990, 4, 14)),
        sentenceDateString: '14/05/1990',
        taggedBailDays: 0,
      }

      expect(dtoService.validatePayload(inputData).parsedInput).toEqual(expectedParsedInput)
    })

    it('should populate inputIndividualSentences in the payload from sentence-length-months and sentence-date', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': 4,
        'sentence-date-day': '11',
        'sentence-date-month': '2',
        'sentence-date-year': '2054',
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          inputIndividualSentences: [{ from: new Date(Date.UTC(2054, 1, 11)), durationMonths: 4 }],
        }),
      )
    })

    it('should include taggedBailAdjustment in the payload when tagged-bail-days is provided', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'tagged-bail-days': 3,
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          taggedBailAdjustment: { name: 'taggedBail', days: 3 },
        }),
      )
    })

    it('should send only the remand start date in the payload, for the API to work out the days', () => {
      const { payload } = dtoService.validatePayload({ ...exampleValidPayload, ...exampleRemandStartDate })

      expect(payload.remandAdjustment).toEqual({
        name: 'remand',
        startDate: new Date(Date.UTC(1990, 4, 9)),
      })
    })
  })

  describe('calculateDTO', () => {
    it('should return expected OutputCalculation object', () => {
      const inputData: InputSentences = {
        offenderName: 'William Gates',
        inputIndividualSentences: [],
      }

      dtoService.calculateDtoSentence(inputData)

      expect(yjbApiClient.calculateDtoSentence).toHaveBeenCalledWith(inputData)
    })
  })
})

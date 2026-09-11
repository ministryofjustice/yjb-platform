import DtoService, { ParsedDtoForm } from './dtoService'
import YjbApiClient from '../data/yjbApi'
import { InputSentences } from '../types/dtoTypes'

jest.mock('../data/yjbApi')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>

describe('DtoService', () => {
  let dtoService: DtoService

  beforeEach(() => {
    dtoService = new DtoService(yjbApiClient)
  })

  describe('validatePayload', () => {
    const exampleValidPayload: Record<string, unknown> = {
      'sentence-length-months': 1,
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

    it.each([1, 6, 11, 24])('should return isValid true for sentence length %s', months => {
      const payload: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': months,
      }
      expect(dtoService.validatePayload(payload).isValid).toBe(true)
    })

    it('should return the raw form data as input', () => {
      const inputData: Record<string, unknown> = { 'some-field': 'some-value' }
      expect(dtoService.validatePayload(inputData).input).toBe(inputData)
    })

    it('should return a payload only when valid', () => {
      expect(dtoService.validatePayload({}).payload).toBeUndefined()
      expect(dtoService.validatePayload(exampleValidPayload).payload).toBeDefined()
    })

    it('should return the parsed form data as parsedInput only when valid', () => {
      const payload: Record<string, unknown> = {
        'sentence-length-months': 1,
        'sentence-date-year': 1990,
        'sentence-date-month': 5,
        'sentence-date-day': 14,
      }
      const expectedParsedInput: ParsedDtoForm = {
        remandDays: 0,
        taggedBailDays: 0,
        sentenceLengthMonths: 1,
        sentenceDate: new Date(Date.UTC(1990, 4, 14)),
        sentenceDateString: '14/05/1990',
      }
      expect(dtoService.validatePayload(payload).parsedInput).toEqual(expectedParsedInput)
      expect(dtoService.validatePayload({}).parsedInput).toBeUndefined()
    })

    it('should populate inputIndividualSentences in the payload from sentence-length-months and sentence-date', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': 3,
        'sentence-date-day': '11',
        'sentence-date-month': '2',
        'sentence-date-year': '2054',
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          inputIndividualSentences: [{ from: new Date(2054, 1, 11), durationMonths: 3 }],
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

    it('should include remandAdjustment in the payload when remand-days is provided', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'remand-days': 5,
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          remandAdjustment: expect.objectContaining({ name: 'remand', days: 5 }),
        }),
      )
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

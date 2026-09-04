import DtoService from './dtoService'
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
    it('should return isValid false when sentence length is not provided', () => {
      const result = dtoService.validatePayload({})
      expect(result.isValid).toBe(false)
    })

    it.each([0, -1, -12, 0.5, 11.5])('should return isValid false for sentence length %s', months => {
      expect(dtoService.validatePayload({ 'sentence-length-months': months }).isValid).toBe(false)
    })

    it.each([1, 6, 11, 24])('should return isValid true for sentence length %s', months => {
      expect(dtoService.validatePayload({ 'sentence-length-months': months }).isValid).toBe(true)
    })

    it('should return the raw form data as input', () => {
      const inputData: Record<string, unknown> = { 'some-field': 'some-value' }
      expect(dtoService.validatePayload(inputData).input).toBe(inputData)
    })

    it('should return a payload only when valid', () => {
      expect(dtoService.validatePayload({}).payload).toBeUndefined()
      expect(dtoService.validatePayload({ 'sentence-length-months': 11 }).payload).toBeDefined()
    })

    it('should populate inputIndividualSentences in the payload from sentence-length-months and sentence-date', () => {
      const inputData: Record<string, unknown> = {
        'sentence-length-months': 11,
        'sentence-date-day': '29',
        'sentence-date-month': '6',
        'sentence-date-year': '2026',
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          inputIndividualSentences: [{ from: new Date(2026, 5, 29), durationMonths: 11 }],
        }),
      )
    })

    it('should include taggedBailAdjustment in the payload when tagged-bail-days is provided', () => {
      const inputData: Record<string, unknown> = {
        'sentence-length-months': 11,
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
        'sentence-length-months': 11,
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

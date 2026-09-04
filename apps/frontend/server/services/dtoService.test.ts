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
    it('should return expected InputSentences object', () => {
      const inputData: Record<string, unknown> = {}
      const expected: InputSentences = {
        offenderName: 'William Gates',
        inputIndividualSentences: [],
      }
      const result = dtoService.validatePayload(inputData)

      expect(result).toEqual(expected)
    })

    it('should validate the sentence-length-months and sentence-date inputs and populate inputIndividualSentences', () => {
      const monthCount: number = 11

      const inputData: Record<string, unknown> = {
        'sentence-length-months': monthCount,
        'sentence-date-day': '29',
        'sentence-date-month': '6',
        'sentence-date-year': '2026',
      }

      const result = dtoService.validatePayload(inputData)

      expect(result).toEqual(
        expect.objectContaining({
          inputIndividualSentences: [
            {
              from: new Date(2026, 5, 29),
              durationMonths: monthCount,
            },
          ],
        }),
      )
    })

    it('should validate the tagged-bail-days input and pass it to the InputSentences output', () => {
      const dayCount: number = 3

      const inputData: Record<string, unknown> = {
        'tagged-bail-days': dayCount,
      }

      const result = dtoService.validatePayload(inputData)

      expect(result).toEqual(
        expect.objectContaining({
          taggedBailAdjustment: {
            name: 'taggedBail',
            days: dayCount,
          },
        }),
      )
    })

    it('should validate the remand-days input and pass it to the InputSentences output', () => {
      const dayCount: number = 5

      const inputData: Record<string, unknown> = {
        'remand-days': dayCount,
      }
      const expected: InputSentences = {
        offenderName: 'William Gates',
        remandAdjustment: {
          name: 'remand',
          startDate: new Date(),
          days: dayCount,
        },
        inputIndividualSentences: [],
      }
      const result = dtoService.validatePayload(inputData)

      expect(result).toEqual(expected)
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

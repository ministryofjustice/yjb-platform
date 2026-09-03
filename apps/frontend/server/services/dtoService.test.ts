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
      const inputData: object = {}
      const expected: InputSentences = {
        offenderName: 'William Gates',
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

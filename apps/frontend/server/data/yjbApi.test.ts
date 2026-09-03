import nock from 'nock'
import YjbApiClient from './yjbApi'
import config from '../config'
import { InputSentences } from '../types/dtoTypes'
import sampleCalculationResult from '../testutils/sampleObjects'

describe('ExampleApiClient', () => {
  let yjbApiClient: YjbApiClient

  beforeEach(() => {
    yjbApiClient = new YjbApiClient()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getTestApiData', () => {
    it('should return a json object with value name equals test-name', async () => {
      // mock data
      nock(config.apis.yjbApi.url).get('/test-api').reply(200, { name: 'test-name' })

      const response = await yjbApiClient.getTestApiData()
      expect(response).toEqual({ name: 'test-name' })
    })
  })

  describe('calculateDtoSentence', () => {
    it('should call the /calculations endpoint', async () => {
      nock(config.apis.yjbApi.url).post('/calculations').reply(200, sampleCalculationResult)

      const input: InputSentences = {
        offenderName: 'Place Holder',
        inputIndividualSentences: [],
      }

      const response = await yjbApiClient.calculateDtoSentence(input)
      expect(response.effectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
    })
  })
})

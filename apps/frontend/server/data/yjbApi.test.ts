import nock from 'nock'
import YjbApiClient from './yjbApi'
import config from '../config'
import { InputSentences } from '../types/dtoTypes'
import sampleCalculationResult from '../testutils/sampleObjects'

describe('ExampleApiClient', () => {
  let yjbApiClient: YjbApiClient

  beforeAll(() => nock.disableNetConnect())
  afterAll(() => nock.enableNetConnect())

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
        offenderName: 'Test Offender',
        remandAdjustment: {
          name: 'remand',
          startDate: new Date('2026-06-14'),
          days: 15,
        },
        inputIndividualSentences: [
          {
            from: new Date('2026-06-29'),
            durationMonths: 11,
          },
        ],
      }

      const response = await yjbApiClient.calculateDtoSentence(input)
      expect(response.effectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
    })

    it('should pass the remand days to the /calculations endpoint', async () => {
      const remandDaysInput: number = 7

      const input: InputSentences = {
        offenderName: 'Place Holder',
        remandAdjustment: {
          name: 'remand',
          startDate: new Date(),
          days: remandDaysInput,
        },
        inputIndividualSentences: [],
      }

      nock(config.apis.yjbApi.url)
        .post('/calculations', body => {
          expect(body).toMatchObject({
            remandAdjustment: { days: remandDaysInput },
          })
          return true
        })
        .reply(200, sampleCalculationResult)

      await yjbApiClient.calculateDtoSentence(input)
      //
      // const response = await yjbApiClient.calculateDtoSentence(input)
      // expect(response.effectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
    })
  })
})

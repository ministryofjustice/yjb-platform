import nock from 'nock'
import { InputSentences } from '@yjb-platform/shared-types'
import YjbApiClient from './yjbApi'
import config from '../config'
import { sampleCalculationResult } from '../testutils/sampleObjects'

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

    it('should pass the remand start date to the /calculations endpoint', async () => {
      const input: InputSentences = {
        offenderName: 'Place Holder',
        remandAdjustment: {
          name: 'remand',
          startDate: new Date('2026-06-14'),
        },
        inputIndividualSentences: [],
      }

      nock(config.apis.yjbApi.url)
        .post('/calculations', body => {
          expect(body).toMatchObject({
            remandAdjustment: { name: 'remand', startDate: '2026-06-14T00:00:00.000Z' },
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

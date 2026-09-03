import nock from 'nock'
import YjbApiClient from './yjbApi'
import config from '../config'
import { SentencePayload } from '../types/sentencePayload'
import { OutputCalculation } from '../types/dtoTypes'

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

      const input: SentencePayload = {
        personName: 'Steve',
      }

      const response = await yjbApiClient.calculateDtoSentence(input)
      expect(response.effectiveDates.totalNumberOfRemandAndTaggedBailDays).toEqual(0)
    })
  })
})

const sampleCalculationResult: OutputCalculation = {
  calculatedTerms: [
    {
      inputSentence: {
        from: new Date('2026-06-29'),
        durationMonths: 11,
      },
      totalDaysInTerm: 334,
      totalDaysMTD: 167,
      sled: new Date('2027-05-28'),
      mtd: new Date('2026-12-12'),
    },
  ],
  effectiveDates: {
    totalNumberOfRemandAndTaggedBailDays: 0,
    sled: new Date('2027-05-13'),
    mtd: new Date('2026-11-27'),
    TUSED: new Date('1970-01-01'),
  },
  effectiveDatesPastAdjustments: [
    {
      adjustmentReason: 'remand',
      adjustmentParameters: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
        days: 0,
      },
      pastEffectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: new Date('2027-05-28'),
        mtd: new Date('2026-12-12'),
        TUSED: new Date('1970-01-01'),
      },
    },
  ],
  ltd: new Date('2026-12-27'),
  etd: new Date('2026-10-27'),
}

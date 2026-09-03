import nock from 'nock'
import YjbApiClient from './yjbApi'
import config from '../config'
import { SentencePayload } from '../types/sentencePayload'

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
    it('should return a json object and success if a valid object is passed in', async () => {
      // mock data
      nock(config.apis.yjbApi.url)
        .post('/calculate-dto', body => {
          return body.payload.personName === 'Steve'
        })
        .reply(200, {})

      const input: SentencePayload = {
        personName: 'Steve',
      }

      const response = await yjbApiClient.calculateDtoSentence(input)
      expect(response).toEqual({})
    })

    it('should return a 400 if incorrect data is passed', async () => {
      // mock data
      nock(config.apis.yjbApi.url)
        .post('/calculate-dto', body => {
          return body.payload.personName !== 'Steve'
        })
        .reply(400)

      const input: SentencePayload = {
        personName: '',
      }

      await expect(yjbApiClient.calculateDtoSentence(input)).rejects.toMatchObject({ responseStatus: 400 })
    })
  })
})

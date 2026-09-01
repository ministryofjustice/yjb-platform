import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import YjbApiClient from '../data/yjbApi'
import { SentencePayload } from '../types/sentencePayload.tx'

jest.mock('../data/yjbApi')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      yjbApiClient,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /calculate', () => {
  it('should render the new calculation', () => {
    return request(app)
      .get('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('New calculation')
        expect(res.text).toContain('Youth Justice Platform - New calculation')
      })
  })
})

describe('POST /calculate', () => {
  it('should render a calculation breakdown page', () => {
    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Calculation breakdown')
        expect(res.text).toContain('Youth Justice Platform - Calculation breakdown')
      })
  })

  it('should call the yjbApiClient with the payload, and return a result', () => {
    const payload: SentencePayload = { personName: 'data' }

    return request(app)
      .post('/calculate')
      .send(payload)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(yjbApiClient.calculateDtoSentence).toHaveBeenCalledWith(payload)
      })
  })
})

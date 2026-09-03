import type { Express } from 'express'
import request from 'supertest'
import { isDeepStrictEqual } from 'util'
import { appWithAllRoutes } from '../testutils/appSetup'
import YjbApiClient from '../data/yjbApi'
import { InputSentences } from '../types/dtoTypes'
import DtoService from '../services/dtoService'

jest.mock('../data/yjbApi')
jest.mock('../services/dtoService')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>
const dtoService = new DtoService(yjbApiClient) as jest.Mocked<DtoService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      dtoService,
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

  it('should call the dtoService.validatePayload with the payload, and return a result', () => {
    const payload: object = {
      formField: 'Testomatic Man!',
    }

    return request(app)
      .post('/calculate')
      .send(payload)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(dtoService.validatePayload).toHaveBeenCalledWith(payload)
      })
  })

  it('should call the dtoService.calculateDtoSentence with a validated payload, and return a result', () => {
    const payload: object = {
      formField: 'Testomatic Man!',
    }

    const validatedPayload: InputSentences = {
      offenderName: 'Place Holder',
      inputIndividualSentences: [],
    }

    dtoService.validatePayload.mockImplementation(input =>
      isDeepStrictEqual(input, payload) ? validatedPayload : undefined,
    )

    return request(app)
      .post('/calculate')
      .send(payload)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(dtoService.calculateDtoSentence).toHaveBeenCalledWith(validatedPayload)
      })
  })
})

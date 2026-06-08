import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import ExampleService from '../services/exampleService'
import YjbApiClient from '../data/yjbApi'

jest.mock('../services/exampleService')
jest.mock('../data/yjbApi')

const exampleService = new ExampleService() as jest.Mocked<ExampleService>
const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      exampleService,
      yjbApiClient,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    exampleService.getCurrentTime()

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This site is under construction...')
        expect(res.text).toContain('The time is currently')
        expect(exampleService.getCurrentTime).toHaveBeenCalled()
      })
  })

  it('service errors are handled', () => {
    exampleService.getCurrentTime.mockImplementation(() => {
      throw new Error('Some problem calling external api!')
    })

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some problem calling external api!')
      })
  })
})

describe('GET /api-test-proxy', () => {
  it('returns data from the API', () => {
    yjbApiClient.getTestApiData.mockResolvedValue({ name: 'test-name' })

    return request(app).get('/api-test-proxy').expect('Content-Type', /json/).expect(200, { name: 'test-name' })
  })
})

import type { Express } from 'express'
import request from 'supertest'
import { isDeepStrictEqual } from 'util'
import * as cheerio from 'cheerio'
import {
  InputSentences,
  OutputCalculation,
  DtoEligibilityStatus,
  buildTransferDatesObj,
} from '@yjb-platform/shared-types'
import { appWithAllRoutes } from '../testutils/appSetup'
import YjbApiClient from '../data/yjbApi'
import DtoService, { ValidationResult } from '../services/dtoService'
import {
  sampleCalculationResult,
  sampleCalculationResult2,
  breakdownObj,
  breakdownObj2,
} from '../testutils/sampleObjects'

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
  it('should render the new calculation form', () => {
    return request(app)
      .get('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('New calculation')
        expect(res.text).toContain('Youth Justice Platform - New calculation')
      })
  })

  describe('should render', () => {
    it('a sentence date of 11/03/2044 when queryString sentenceDate=11/03/2044 is passed', () => {
      return request(app)
        .get('/calculate?sentenceDate=12/04/2045')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('#sentence-date-day').attr('value')).toContain('12')
          expect($('#sentence-date-month').attr('value')).toContain('4')
          expect($('#sentence-date-year').attr('value')).toContain('2045')
        })
    })

    const fieldTestCases = [
      ['11', '#sentence-length-months', 'sentenceLengthMonths'],
      ['73', '#remand-days', 'remandDays'],
      ['654', '#tagged-bail-days', 'taggedBailDays'],
    ]
    it.each(fieldTestCases)('%s in field %s when queryString %s is passed', (value, elementId, queryString) => {
      return request(app)
        .get(`/calculate?${queryString}=${value}`)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($(elementId).attr('value')).toContain(value)
        })
    })
  })
})

describe('POST /calculate', () => {
  it('should render a calculation breakdown page when the payload is valid', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Calculation breakdown')
        expect(res.text).toContain('Youth Justice Platform - Calculation breakdown')
      })
  })

  it('should pass the calculationResult into the template', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult,
      etd: buildTransferDatesObj(DtoEligibilityStatus.oneMonth, new Date('01/01/3093')),
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#release-dates').text()).toContain('Sun Jan 01 3093')
      })
  })

  it('should pass the breakdownObj with custodial breakdown into the template', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult,
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#detailed-breakdown').text()).toContain(breakdownObj.custodialPeriodBreakdown)
      })
  })

  it('should pass the breakdownObj into the template for with custodial breakdown with rounded number', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult2,
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#detailed-breakdown').text()).toContain(breakdownObj2.custodialPeriodBreakdown)
      })
  })

  it('should pass the breakdownObj into the template for MTD breakdown', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult,
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#detailed-breakdown').text()).toContain(breakdownObj.mtdBreadown)
      })
  })

  it('should pass the breakdownObj into the template for remand period breakdown', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult,
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#detailed-breakdown').text()).toContain(breakdownObj.remandPeriodBreakdown)
        expect(breakdownObj.remandPeriodBreakdown).toBe('(14 June 2026 to 28 June 2026)')
      })
  })

  it('should render the remand period breakdown correctly when dates arrive as JSON-serialized strings (real API shape)', () => {
    const validResult: ValidationResult = {
      isValid: true,
      input: {},
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    // the real API sends dates as plain YYYY-MM-DD strings, not Date objects -
    // this simulates that shape to guard against calling Date-only methods on a string
    const mockCalculationResult: OutputCalculation = JSON.parse(JSON.stringify(sampleCalculationResult))
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#detailed-breakdown').text()).toContain('(14 June 2026 to 28 June 2026)')
      })
  })

  it('should pass the parsed input into the template', () => {
    const input: Record<string, unknown> = {
      formField: 'Testomatic Man!',
    }

    const validResult: ValidationResult = {
      isValid: true,
      input,
      parsedInput: {
        remandDays: 33,
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date('01/22/2033'),
        sentenceDateString: '01/22/2033',
      },
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }

    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)

    return request(app)
      .post('/calculate')
      .send(input)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.govuk-back-link').prop('href')).toContain(`remandDays=${validResult.parsedInput.remandDays}`)
      })
  })

  it('should render the new calculation page when the payload is invalid', () => {
    const invalidResult: ValidationResult = {
      isValid: false,
      input: {},
    }
    dtoService.validatePayload.mockReturnValue(invalidResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('New calculation')
      })
  })

  it('should call the dtoService.validatePayload with the payload, and return a result', () => {
    const payload: object = {
      formField: 'Testomatic Man!',
    }

    dtoService.validatePayload.mockReturnValue({ isValid: false, input: payload as Record<string, unknown> })

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
      isDeepStrictEqual(input, payload)
        ? { isValid: true, input, payload: validatedPayload }
        : { isValid: false, input },
    )
    dtoService.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)

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

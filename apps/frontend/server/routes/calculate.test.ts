import type { Express } from 'express'
import request from 'supertest'
import { isDeepStrictEqual } from 'util'
import * as cheerio from 'cheerio'
import { InputSentences, OutputCalculation, DtoEligibilityStatus } from '@yjb-platform/shared-types'
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
    it('a sentence date of 12/04/2045 when queryString sentenceDate=2045-04-12 is passed', () => {
      return request(app)
        .get('/calculate?sentenceDate=2045-04-12')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('#sentence-date-day').attr('value')).toContain('12')
          expect($('#sentence-date-month').attr('value')).toContain('4')
          expect($('#sentence-date-year').attr('value')).toContain('2045')
        })
    })

    it('a remand start date of 20/10/2026 when queryString remandStartDate=2026-10-20 is passed', () => {
      return request(app)
        .get('/calculate?remandStartDate=2026-10-20')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('#remand-start-date-day').attr('value')).toContain('20')
          expect($('#remand-start-date-month').attr('value')).toContain('10')
          expect($('#remand-start-date-year').attr('value')).toContain('2026')
        })
    })

    it.each([
      ['missing', ''],
      ['not a date', '?sentenceDate=abc&remandStartDate=abc'],
      ['impossible (31 February)', '?sentenceDate=2026-02-31&remandStartDate=2026-02-31'],
    ])('empty date boxes when the dates in the queryString are %s', (_description, queryString) => {
      return request(app)
        .get(`/calculate${queryString}`)
        .expect(200)
        .expect(res => {
          const $ = cheerio.load(res.text)
          const dateBoxIds = [
            '#sentence-date-day',
            '#sentence-date-month',
            '#sentence-date-year',
            '#remand-start-date-day',
            '#remand-start-date-month',
            '#remand-start-date-year',
          ]
          dateBoxIds.forEach(id => {
            expect($(id).attr('value')).toBeUndefined()
          })
        })
    })

    const fieldTestCases = [
      ['11', '#sentence-length-months', 'sentenceLengthMonths'],
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
      parsedInput: {},
      errors: [],
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Sentence calculation results')
        expect(res.text).toContain('Youth Justice Platform - Sentence calculation results')
      })
  })

  it('should pass the calculationResult into the template', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
      payload: { offenderName: 'Place Holder', inputIndividualSentences: [] },
    }
    const mockCalculationResult: OutputCalculation = {
      ...sampleCalculationResult,
      etd: {
        data: new Date('3093-01-01'),
        metadata: {
          dayOfWeek: 'Sunday',
          status: DtoEligibilityStatus.oneMonth,
          message: '1 month away from the MTD for DTOs with terms from 8 to 18 months',
        },
      },
    }
    dtoService.validatePayload.mockReturnValue(validResult)
    dtoService.calculateDtoSentence.mockResolvedValue(mockCalculationResult)

    return request(app)
      .post('/calculate')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#calculation-results-tab').text()).toContain('Sunday, 1 January 3093')
      })
  })

  it('should pass the breakdownObj with custodial breakdown into the template', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
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
        expect($('#results-breakdown-tab').text()).toContain(breakdownObj.custodialPeriodBreakdown)
      })
  })

  it('should pass the breakdownObj into the template for with custodial breakdown with rounded number', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
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
        expect($('#results-breakdown-tab').text()).toContain(breakdownObj2.custodialPeriodBreakdown)
      })
  })

  it('should pass the date breakdowns into the template', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
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
        const detailedBreakdown = $('#results-breakdown-tab').text()
        expect(detailedBreakdown).toContain(breakdownObj.mtdBreakdown)
        expect(detailedBreakdown).toContain(breakdownObj.finalSledBreakdown)
        expect(detailedBreakdown).toContain(breakdownObj.finalMtdBreakdown)
        expect(detailedBreakdown).toContain(breakdownObj.etdBreakdown)
        expect(detailedBreakdown).toContain(breakdownObj.ltdBreakdown)
      })
  })

  it('should pass the breakdownObj into the template for remand period breakdown', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
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
        expect($('#results-breakdown-tab').text()).toContain(breakdownObj.remandPeriodBreakdown)
        expect(breakdownObj.remandPeriodBreakdown).toBe('(14 June 2026 to 28 June 2026)')
      })
  })

  it('should render the remand period breakdown correctly when dates arrive as JSON-serialized strings (real API shape)', () => {
    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {},
      errors: [],
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
        expect($('#results-breakdown-tab').text()).toContain('(14 June 2026 to 28 June 2026)')
      })
  })

  it('should pass the parsed input into the template', () => {
    const input: Record<string, unknown> = {
      formField: 'Testomatic Man!',
    }

    const validResult: ValidationResult = {
      isValid: true,
      parsedInput: {
        remandStartDate: new Date(Date.UTC(2032, 11, 20)),
        remandStartDateString: '20 December 2032',
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date(Date.UTC(2033, 0, 22)),
        sentenceDateString: '22 January 2033',
      },
      errors: [],
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
        expect($('.govuk-back-link').prop('href')).toContain('remandStartDate=2032-12-20')
      })
  })

  it('should render the new calculation page when the payload is invalid', () => {
    const invalidResult: ValidationResult = {
      isValid: false,
      parsedInput: {},
      errors: [],
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

    dtoService.validatePayload.mockReturnValue({
      isValid: false,
      parsedInput: {},
      errors: [],
    })

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
        ? { isValid: true, input, parsedInput: {}, errors: [], payload: validatedPayload }
        : { isValid: false, input, parsedInput: {}, errors: [] },
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

describe('back link from the calculation breakdown page', () => {
  // the rest of this file mocks DtoService - these tests need the real one, so the back link is
  // built from what the form really produces. Only the API call is mocked
  const RealDtoService: typeof DtoService = jest.requireActual('../services/dtoService').default

  let appWithRealDtoService: Express

  beforeEach(() => {
    yjbApiClient.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)
    appWithRealDtoService = appWithAllRoutes({
      services: { dtoService: new RealDtoService(yjbApiClient), yjbApiClient },
    })
  })

  const completedForm = {
    'sentence-date-day': '29',
    'sentence-date-month': '6',
    'sentence-date-year': '2026',
    'sentence-length-months': '11',
    'remand-start-date-day': '14',
    'remand-start-date-month': '6',
    'remand-start-date-year': '2026',
    'tagged-bail-days': '5',
  }

  async function submitForm(form: Record<string, string>): Promise<cheerio.CheerioAPI> {
    const response = await request(appWithRealDtoService).post('/calculate').type('form').send(form).expect(200)
    return cheerio.load(response.text)
  }

  async function followLink(href: string): Promise<cheerio.CheerioAPI> {
    const response = await request(appWithRealDtoService).get(href).expect(200)
    return cheerio.load(response.text)
  }

  it('refills the form with everything that was submitted', async () => {
    const breakdownPage = await submitForm(completedForm)
    const backHref = breakdownPage('.govuk-back-link').attr('href')

    const formPage = await followLink(backHref)

    expect(formPage('#sentence-date-day').attr('value')).toBe('29')
    expect(formPage('#sentence-date-month').attr('value')).toBe('6')
    expect(formPage('#sentence-date-year').attr('value')).toBe('2026')
    expect(formPage('#sentence-length-months').attr('value')).toBe('11')
    expect(formPage('#remand-start-date-day').attr('value')).toBe('14')
    expect(formPage('#remand-start-date-month').attr('value')).toBe('6')
    expect(formPage('#remand-start-date-year').attr('value')).toBe('2026')
    expect(formPage('#tagged-bail-days').attr('value')).toBe('5')
  })

  it('uses the same link for "Edit"', async () => {
    const breakdownPage = await submitForm(completedForm)

    const backHref = breakdownPage('.govuk-back-link').attr('href')
    const changeAnswersHref = breakdownPage('.govuk-summary-card__actions .govuk-link').attr('href')

    expect(changeAnswersHref).toBe(backHref)
  })

  it('does not put "undefined" in the link when the optional remand and tagged bail are left blank', async () => {
    const breakdownPage = await submitForm({
      ...completedForm,
      'remand-start-date-day': '',
      'remand-start-date-month': '',
      'remand-start-date-year': '',
      'tagged-bail-days': '',
    })
    const backHref = breakdownPage('.govuk-back-link').attr('href')

    expect(backHref).not.toContain('undefined')

    const formPage = await followLink(backHref)
    expect(formPage('#remand-start-date-day').attr('value')).toBeUndefined()
    expect(formPage('#remand-start-date-month').attr('value')).toBeUndefined()
    expect(formPage('#remand-start-date-year').attr('value')).toBeUndefined()
  })
})

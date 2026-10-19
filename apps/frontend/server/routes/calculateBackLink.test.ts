import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../testutils/appSetup'
import YjbApiClient from '../data/yjbApi'
import DtoService from '../services/dtoService'
import { sampleCalculationResult } from '../testutils/sampleObjects'

// these tests use the real DtoService, so the back link is built from what the form really
// produces - only the API call is mocked
jest.mock('../data/yjbApi')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>
const dtoService = new DtoService(yjbApiClient)

let app: Express

beforeEach(() => {
  yjbApiClient.calculateDtoSentence.mockResolvedValue(sampleCalculationResult)
  app = appWithAllRoutes({ services: { dtoService, yjbApiClient } })
})

afterEach(() => {
  jest.resetAllMocks()
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
  const response = await request(app).post('/calculate').type('form').send(form).expect(200)
  return cheerio.load(response.text)
}

async function followLink(href: string): Promise<cheerio.CheerioAPI> {
  const response = await request(app).get(href).expect(200)
  return cheerio.load(response.text)
}

describe('back link from the calculation breakdown page', () => {
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

  it('uses the same link for "Change answers"', async () => {
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

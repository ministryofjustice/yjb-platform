import * as cheerio from 'cheerio'
import { OutputCalculation } from '@yjb-platform/shared-types'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import { sampleCalculationResult, breakdownObj, termDates, resultDates } from '../../testutils/sampleObjects'
import { CalculationBreakdownInputData } from '../../routes/calculate'

const env = createNunjucksTestSetup()
const renderWithCheerio = (context = {}) => cheerio.load(env.render('pages/calculation-breakdown.njk', context))

describe('Calculation breakdown page', () => {
  describe('content', () => {
    it('renders the title', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('title').text()).toBe('Youth Justice Platform - Calculation breakdown')
    })

    it('renders the page headings', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('h1').text()).toBe('Calculation breakdown')
    })
  })

  describe('navigation', () => {
    it('renders a back button pointing to the calculation page', () => {
      const cheerioPage = renderWithCheerio()
      const button = cheerioPage('.govuk-back-link')
      expect(button.text()).toBe('Back')
      expect(button.prop('href')).toContain('/calculate?')
    })

    it('passes the submitted form data to the back button', () => {
      const parsedInput: CalculationBreakdownInputData = {
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date(Date.UTC(2033, 0, 22)),
        sentenceDateString: '22 January 2033',
        sentenceDateBtnStr: '22/01/2033',
        remandStartDate: new Date(Date.UTC(2032, 11, 20)),
        remandStartDateString: '20 December 2032',
        remandStartDateBtnStr: '20/12/2032',
      }
      const cheerioPage = renderWithCheerio({ inputData: parsedInput })
      const button = cheerioPage('.govuk-back-link')
      expect(button.prop('href')).toContain(`remandStartDate=2032-12-20`)
      expect(button.prop('href')).toContain(`taggedBailDays=${parsedInput.taggedBailDays}`)
      expect(button.prop('href')).toContain(`sentenceLengthMonths=${parsedInput.sentenceLengthMonths}`)
      expect(button.prop('href')).toContain(`sentenceDate=2033-01-22`)
    })

    it('includes a Start a new calculation button', () => {
      const cheerioPage = renderWithCheerio()
      const link = cheerioPage('#new-calculation-link-b')
      expect(link.text()).toBe('Start a new DTO calculation')
      expect(link.prop('href')).toBe('/calculate')
    })
  })

  describe('data', () => {
    const expectedCalcValues: string[][] = [
      ['Term length', '11 months (334 days)'],
      ['Custodial period', '167 days'],
      ['MTD', 'Saturday 2026-12-12'],
      ['Remand period', '15 days'],
      ['SLED', 'Thursday 2027-05-13'],
      ['Final MTD', 'Friday 2026-11-27'],
      ['LTD', 'Sunday 2026-12-27'],
      ['ETD', 'Tuesday 2026-10-27'],
    ]

    const expectedExplanationValues: string[][] = [
      ['Term length', ', from 29 June 2026 to 13 May 2027'],
      ['Custodial period', '(334 divided by 2)'],
      ['MTD', 'Saturday, 12 December 2026, 167 days from the beginning of the sentence (2026-06-29)'],
      ['Remand period', '(14 June 2026 to 28 June 2026)'],
      ['SLED', 'Thursday, 13 May 2027, 2027-05-28 minus 15 days'],
      ['Final MTD', 'Friday, 27 November 2026, 2026-12-12 minus 15 days'],
      ['LTD', 'Sunday, 27 December 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months'],
      ['ETD', 'Tuesday, 27 October 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months'],
    ]

    describe('your answers section', () => {
      const parsedInput: CalculationBreakdownInputData = {
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date(Date.UTC(2033, 0, 22)),
        sentenceDateString: '22 January 2033',
        sentenceDateBtnStr: '22/01/2033',
        remandStartDate: new Date(Date.UTC(2032, 11, 20)),
        remandStartDateString: '20 December 2032',
        remandStartDateBtnStr: '20/12/2032',
      }

      it('renders the panel', () => {
        const cheerioPage = renderWithCheerio()
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Your answers')
      })

      it('renders the sentence date', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Sentence date')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(parsedInput.sentenceDateString)
      })

      it('renders the sentence length', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Sentence length')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(`${parsedInput.sentenceLengthMonths} months`)
      })

      it('renders the remand date', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Remand start date')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(parsedInput.remandStartDateString)
      })

      it('renders the tagged bail days', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Days spent on tagged bail')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(parsedInput.taggedBailDays.toString())
      })

      it('renders appropriate change answers link', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        const changeAnswersLink = cheerioPage('.govuk-summary-card .govuk-summary-card__actions .govuk-link')
        expect(changeAnswersLink.prop('href')).toContain(`remandStartDate=2032-12-20`)
        expect(changeAnswersLink.prop('href')).toContain(`taggedBailDays=${parsedInput.taggedBailDays}`)
        expect(changeAnswersLink.prop('href')).toContain(`sentenceLengthMonths=${parsedInput.sentenceLengthMonths}`)
        expect(changeAnswersLink.prop('href')).toContain(`sentenceDate=2033-01-22`)
      })
    })

    describe('Calculation outputs B', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult, breakdownObj, termDates, resultDates })

      const calculationDataRows: Record<string, string> = {}
      cheerioPage('#calculation-results-tab .govuk-summary-list__row').each((_, el) => {
        const key = cheerioPage(el).find('.govuk-summary-list__key').text().trim()
        calculationDataRows[key] = cheerioPage(el).find('.govuk-summary-list__value').text().trim()
      })

      const explanationDataRows: Record<string, string> = {}
      cheerioPage('#results-breakdown-tab .govuk-summary-list__row').each((_, el) => {
        const key = cheerioPage(el).find('.govuk-summary-list__key').text().trim()
        explanationDataRows[key] = cheerioPage(el).find('.govuk-summary-list__value').text().trim()
      })

      it.each(expectedCalcValues)('correctly renders the calculation result for %s', (key: string, value: string) => {
        expect(calculationDataRows).toMatchObject({
          [key]: expect.stringContaining(value),
        })
      })

      it.each(expectedExplanationValues)(
        'correctly renders the calculation explanations for %s',
        (key: string, value: string) => {
          expect(explanationDataRows).toMatchObject({
            [key]: expect.stringContaining(value),
          })
        },
      )
    })
  })
})

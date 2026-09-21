import * as cheerio from 'cheerio'
import { OutputCalculation } from '@yjb-platform/shared-types'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import sampleCalculationResult from '../../testutils/sampleObjects'
import { ParsedDtoForm } from '../../services/dtoService'

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
      const parsedInput: ParsedDtoForm = {
        remandDays: 33,
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date('01/22/2033'),
        sentenceDateString: '01/22/2033',
      }
      const cheerioPage = renderWithCheerio({ inputData: parsedInput })
      const button = cheerioPage('.govuk-back-link')
      expect(button.prop('href')).toContain(`remandDays=${parsedInput.remandDays}`)
      expect(button.prop('href')).toContain(`taggedBailDays=${parsedInput.taggedBailDays}`)
      expect(button.prop('href')).toContain(`sentenceLengthMonths=${parsedInput.sentenceLengthMonths}`)
      expect(button.prop('href')).toContain(`sentenceDate=01/22/2033`)
    })

    it('includes a Start a new calculation button', () => {
      const cheerioPage = renderWithCheerio()
      const link = cheerioPage('#new-calculation-link')
      expect(link.text()).toBe('Start a new calculation')
      expect(link.prop('href')).toBe('/calculate')
    })
  })

  describe('data', () => {
    const expectedCalcValues: string[][] = [
      ['Term length', '11 months (334 days)'],
      ['Final Sled', 'Thu May 13 2027'],
      ['Final MTD', 'Fri Nov 27 2026'],
      ['LTD', 'Sun Dec 27 2026'],
      ['ETD', 'Tue Oct 27 2026']
    ]

    const expectedExplanationValues: string[][] = [
      ['Term length', ', from 2026-06-29 to 2027-05-13'],
      ['Final Sled', '(2027-05-28 minus 15 days)'],
      ['Final MTD', '(2026-12-12 minus 15 days)'],
      ['LTD', '(1 month away from the MTD for DTOs of 8 months, but less then 18 months)'],
      ['ETD', '(1 month away from the MTD for DTOs of 8 months, but less then 18 months)']
    ]


    describe('your answers section', () => {
      const parsedInput: ParsedDtoForm = {
        remandDays: 33,
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date('01/22/2033'),
        sentenceDateString: '01/22/2033',
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

      it('renders the remand days', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Days spent on remand')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(parsedInput.remandDays.toString())
      })

      it('renders the tagged bail days', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        expect(cheerioPage('.govuk-summary-card').text()).toContain('Days spent on tagged bail')
        expect(cheerioPage('.govuk-summary-card').text()).toContain(parsedInput.taggedBailDays.toString())
      })

      it('renders appropriate change answers link', () => {
        const cheerioPage = renderWithCheerio({ inputData: parsedInput })
        const changeAnswersLink = cheerioPage('.govuk-summary-card .govuk-summary-card__actions .govuk-link')
        expect(changeAnswersLink.prop('href')).toContain(`remandDays=${parsedInput.remandDays}`)
        expect(changeAnswersLink.prop('href')).toContain(`taggedBailDays=${parsedInput.taggedBailDays}`)
        expect(changeAnswersLink.prop('href')).toContain(`sentenceLengthMonths=${parsedInput.sentenceLengthMonths}`)
        expect(changeAnswersLink.prop('href')).toContain(`sentenceDate=01/22/2033`)
      })
    })

    describe('Results summary', () => {
      it('it renders the Release Dates passed from the model', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        const summaryData: Record<string, string> = {}

        cheerioPage('#release-dates .govuk-summary-list__row').each((_, el) => {
          const key = cheerioPage(el).find('.govuk-summary-list__key').text().trim()
          summaryData[key] = cheerioPage(el).find('.govuk-summary-list__value').text().trim()
        })

        expect(summaryData).toMatchObject({
          ETD: expect.stringContaining('Tue Oct 27 2026'),
          MTD: expect.stringContaining('Fri Nov 27 2026'),
          LTD: expect.stringContaining('Sun Dec 27 2026'),
          SLED: expect.stringContaining('Thu May 13 2027'),
        })
      })
    })

    describe('Results breakdown', () => {
      it('it renders the Detailed Breakdown MTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        expect(cheerioPage('#detailed-breakdown').text()).toContain('MTD: ')
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Sat Dec 12 2026')
      })

      it('it renders the Detailed Breakdown Final Sled passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Final Sled: ')
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Thu May 13 2027')
      })

      it('it renders the Detailed Breakdown Final MTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Final MTD: ')
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Fri Nov 27 2026 ')
      })

      it('it renders the Detailed Breakdown ETD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        expect(cheerioPage('#detailed-breakdown').text()).toContain('ETD: ')
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Tue Oct 27 2026')
      })

      it('it renders the Detailed Breakdown LTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
        const calculationResult: OutputCalculation = sampleCalculationResult
        const cheerioPage = renderWithCheerio({ calculationResult })
        expect(cheerioPage('#detailed-breakdown').text()).toContain('LTD: ')
        expect(cheerioPage('#detailed-breakdown').text()).toContain('Sun Dec 27 2026')
      })
    })

    describe('Calculation outputs A', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })

      it.each(expectedCalcValues)('Correctly renders the calculation values for %s', (_key: string, value: string) => {
        expect(cheerioPage('#detailed-breakdown').text()).toContain(value)
      })

      it.each(expectedExplanationValues)('Correctly renders the calculation explanations for %s', (_key: string, value: string) => {
        expect(cheerioPage('#detailed-breakdown').text()).toContain(value)
      })
    })

    describe('Calculation outputs B', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })

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

      it.each(expectedCalcValues)(
        'Correctly renders the calculation result for %s',
        (key: string, value: string) => {
          expect(calculationDataRows).toMatchObject({
            [key]: expect.stringContaining(value),
          })
        },
      )

      it.each(expectedCalcValues)(
        'Correctly renders the calculation explanations for %s',
        (key: string, value: string) => {
          expect(explanationDataRows).toMatchObject({
            [key]: expect.stringContaining(value),
          })
        },
      )
    })
  })
})

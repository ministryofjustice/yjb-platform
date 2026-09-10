import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import {InputSentences, OutputCalculation} from '../../types/dtoTypes'
import sampleCalculationResult from '../../testutils/sampleObjects'
import {ParsedDtoForm} from "../../services/dtoService";

const env = createNunjucksTestSetup()
const renderWithCheerio = (context = {}) => cheerio.load(env.render('pages/calculation-breakdown.njk', context))
// const renderWithoutCheerio = (context = {}) => env.render('pages/calculation-breakdown.njk', context)

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
      const inputData: ParsedDtoForm = {
        remandDays: 33,
        taggedBailDays: 44,
        sentenceLengthMonths: 22,
        sentenceDate: new Date("01/22/2033"),
        sentenceDateString: "01/22/2033"
      }
      const cheerioPage = renderWithCheerio({ inputData })
      const button = cheerioPage('.govuk-back-link')
      expect(button.prop('href')).toContain(`remandDays=${inputData.remandDays}`)
      expect(button.prop('href')).toContain(`taggedBailDays=${inputData.taggedBailDays}`)
      expect(button.prop('href')).toContain(`sentenceLengthMonths=${inputData.sentenceLengthMonths}`)
      expect(button.prop('href')).toContain(`sentenceDate=01/22/2033`)
      // expect(button.prop('href')).toContain(`sentenceDate=${inputData.sentenceDate.toString()}`)
    })
  })

  describe('data', () => {
    it('it renders the Release Dates ETD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('ETD: Earliest Transfer Date Tue Oct 27 2026')
    })

    it('it renders the  Release Dates MTD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('MTD: Mid term date Fri Nov 27 2026')
    })

    it('it renders the  Release Dates LTD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('LTD: Latest Transfer Date Sun Dec 27 2026')
    })

    it('it renders the Release Dates SLED passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('SLED: Sentence and licence expiry date Thu May 13 2027')
    })

    it('it renders the Detailed Breakdown MTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#detailed-breakdown').text()).toContain('MTD: Sat Dec 12 2026')
    })

    it('it renders the Detailed Breakdown Final Sled passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#detailed-breakdown').text()).toContain('Final Sled: Thu May 13 2027')
    })

    it('it renders the Detailed Breakdown Final MTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#detailed-breakdown').text()).toContain('Final MTD: Fri Nov 27 2026 ')
    })

    it('it renders the Detailed Breakdown ETD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#detailed-breakdown').text()).toContain('ETD: Tue Oct 27 2026')
    })

    it('it renders the Detailed Breakdown LTD passed from the model for sentence 19/06/26, 15 days remand 11 months', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#detailed-breakdown').text()).toContain('LTD: Sun Dec 27 2026')
    })
  })
})

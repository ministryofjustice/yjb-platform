import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import { OutputCalculation } from '../../types/dtoTypes'
import sampleCalculationResult from '../../testutils/sampleObjects'

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

  describe('data', () => {
    it('it renders the ETD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('ETD: Earliest Transfer Date Tue Oct 27 2026')
    })

    it('it renders the MTD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('MTD: Mid term date Fri Nov 27 2026')
    })

    it('it renders the LTD passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('LTD: Latest Transfer Date Sun Dec 27 2026')
    })

    it('it renders the SLED passed from the model', () => {
      const calculationResult: OutputCalculation = sampleCalculationResult
      const cheerioPage = renderWithCheerio({ calculationResult })
      expect(cheerioPage('#release-dates').text()).toContain('SLED: Sentence and licence expiry date Thu May 13 2027')
    })
  })
})

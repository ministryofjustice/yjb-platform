import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import { CalculationResult } from '../../types/calculationResult'

const env = createNunjucksTestSetup()
const renderWithCheerio = (context = {}) => cheerio.load(env.render('pages/calculation-breakdown.njk', context))

describe('Calculation breakdown page', () => {
  it('renders the title', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('title').text()).toBe('Youth Justice Platform - Calculation breakdown')
  })

  it('renders the page heading', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('h1').text()).toBe('Calculation breakdown')
  })

  it('renders the name of the person', () => {
    const calculationResult: CalculationResult = {
      personName: 'test name',
    }
    const cheerioPage = renderWithCheerio({ calculationResult })
    expect(cheerioPage('body').text()).toContain('test name')
  })
})

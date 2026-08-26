import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'

const env = createNunjucksTestSetup()
const renderWithCheerio = () => cheerio.load(env.render('pages/calculation-breakdown.njk'))

describe('Calculation breakdown page', () => {
  it('renders the title', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('title').text()).toBe('Youth Justice Platform - Calculation breakdown')
  })

  it('renders the page heading', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('h1').text()).toBe('Calculation breakdown')
  })
})

import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'

const env = createNunjucksTestSetup()
const renderWithCheerio = (context = {}) => cheerio.load(env.render('pages/index.njk', context))

describe('Index page', () => {
  it('renders the tab title', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('title').text()).toBe('Youth Justice Platform - Home')
  })

  it('renders the page heading', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('h1').text()).toBe('This site is under construction...')
  })

  it('renders the current time when data is passed in', () => {
    const cheerioPage = renderWithCheerio({ currentTime: '12:00' })
    expect(cheerioPage('[data-qa="timestamp"]').text()).toContain('12:00')
  })
})

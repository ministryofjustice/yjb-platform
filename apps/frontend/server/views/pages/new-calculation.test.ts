import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'

const env = createNunjucksTestSetup()
const renderWithCheerio = () => cheerio.load(env.render('pages/new-calculation.njk'))

describe('New calculation page', () => {
  describe('content', () => {
    it('renders the tab title', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('title').text()).toBe('Youth Justice Platform - New calculation')
    })

    it('renders the page heading and subheading', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('h1').text()).toBe('New calculation')
      expect(cheerioPage('h2').first().text()).toBe('Offence and sentence details')
    })

    it('renders the expected text', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('#instruction-text').text()).toBe('Enter the calculation details below')
    })
  })

  describe('logic', () => {
    it('contains a calculate button', () => {
      const cheerioPage = renderWithCheerio()
      const continueButton = cheerioPage('#calculate-button')
      expect(continueButton.text()).toContain('Calculate')
    })

    it('has a submission form for /calculate', () => {
      const cheerioPage = renderWithCheerio()
      const inputForm = cheerioPage('#calculation-form')
      expect(inputForm.prop('method')).toBe('post')
      expect(inputForm.prop('action')).toBe('/calculate')
    })
  })

  describe('inputs', () => {
    it('includes the sentence type dropdown', () => {
      const cheerioPage = renderWithCheerio()

      const typeInput = cheerioPage('#sentence-type')
      expect(typeInput.length).toBe(1)

      const dropdownOptions = typeInput
        .find('option')
        .toArray()
        .map(el => cheerioPage(el))

      // check default option is blank
      expect(dropdownOptions[0].attr('disabled')).toBeDefined()
      expect(dropdownOptions[0].attr('selected')).toBeDefined()
      expect(dropdownOptions[0].text().trim()).toBe('')

      // check options are correct
      expect(dropdownOptions[1].text().trim()).toBe('Some sentence that is applicable to DTO')
      expect(dropdownOptions[1].attr('value')).toBe('some-sentence-code')
    })

    it('includes the sentence date input', () => {
      const cheerioPage = renderWithCheerio()

      expect(cheerioPage('#sentence-date').length).toBe(1)
      expect(cheerioPage('#sentence-date').closest('fieldset').find('legend').text()).toContain('Sentence date')
    })

    it('includes a remand periods fieldset containing remand and tagged bail inputs', () => {
      const cheerioPage = renderWithCheerio()

      const remandFieldset = cheerioPage('fieldset').filter((_, el) =>
        cheerioPage(el).find('legend').text().includes('Remand periods'),
      )
      expect(remandFieldset.length).toBe(1)
      expect(remandFieldset.find('#remand-days').attr('name')).toEqual('remand-days')
      expect(remandFieldset.find('#tagged-bail-days').attr('name')).toEqual('tagged-bail-days')
    })

    it('includes a length of sentence fieldset with a months input', () => {
      const cheerioPage = renderWithCheerio()

      const sentenceFieldset = cheerioPage('fieldset').filter((_, el) =>
        cheerioPage(el).find('legend').text().includes('Length of sentence'),
      )
      expect(sentenceFieldset.length).toBe(1)
      expect(sentenceFieldset.find('#sentence-length-months').attr('name')).toEqual('sentence-length-months')
    })
  })
})

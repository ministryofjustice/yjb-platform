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
      expect(cheerioPage('h1').text()).toBe('Start a new calculation')
      expect(cheerioPage('h2').first().text()).toBe('Offence and sentence details')
    })

    it('renders the expected text', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('#instruction-text').text()).toBe('Use this tool to check a Detention and Training Order (DTO) calculation.')
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

    it('includes a remand start date input and a tagged bail input', () => {
      const cheerioPage = renderWithCheerio()

      const remandStartDate = cheerioPage('#remand-start-date')
      expect(remandStartDate.length).toBe(1)
      expect(remandStartDate.closest('fieldset').find('legend').text()).toContain('Remand start date (optional)')
      expect(cheerioPage('#tagged-bail-days').attr('name')).toEqual('tagged-bail-days')
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

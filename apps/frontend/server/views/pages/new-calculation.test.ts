import * as cheerio from 'cheerio'
import { ValidationErrorMessages } from '@yjb-platform/shared-types'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'

const env = createNunjucksTestSetup()
const renderWithCheerio = (context: object = {}) => cheerio.load(env.render('pages/new-calculation.njk', context))

describe('New calculation page', () => {
  describe('content', () => {
    it('renders the tab title', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('title').text()).toBe('Youth Justice Platform - New calculation')
    })

    it('renders the page heading and subheading', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('h1').text()).toBe('Start a new calculation')
    })

    it('renders the expected text', () => {
      const cheerioPage = renderWithCheerio()
      expect(cheerioPage('#instruction-text').text()).toBe(
        'Use this tool to check a Detention and Training Order (DTO) calculation.',
      )
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
    // Sentence type dropdown not needed for now
    // it('includes the sentence type dropdown', () => {
    //   const cheerioPage = renderWithCheerio()

    //   const typeInput = cheerioPage('#sentence-type')
    //   expect(typeInput.length).toBe(1)

    //   const dropdownOptions = typeInput
    //     .find('option')
    //     .toArray()
    //     .map(el => cheerioPage(el))

    //   // check default option is blank
    //   expect(dropdownOptions[0].attr('disabled')).toBeDefined()
    //   expect(dropdownOptions[0].attr('selected')).toBeDefined()
    //   expect(dropdownOptions[0].text().trim()).toBe('')

    //   // check options are correct
    //   expect(dropdownOptions[1].text().trim()).toBe('Some sentence that is applicable to DTO')
    //   expect(dropdownOptions[1].attr('value')).toBe('some-sentence-code')
    // })

    it('includes the sentence date input', () => {
      const cheerioPage = renderWithCheerio()

      expect(cheerioPage('#sentence-date').length).toBe(1)
      expect(cheerioPage('#sentence-date').closest('fieldset').find('legend').text()).toContain('Sentence date')
    })

    it('includes the ERD eligibility input', () => {
      const cheerioPage = renderWithCheerio()

      const eligibilityOptions = cheerioPage('#erd-eligibility')
        .closest('div.govuk-radios')
        .find('input')
        .toArray()
        .map(input => ({
          value: cheerioPage(input).attr('value'),
          label: cheerioPage(input).next('label').text().trim(),
        }))

      expect(eligibilityOptions).toHaveLength(2)
      expect(eligibilityOptions).toEqual(
        expect.arrayContaining([
          { value: 'true', label: 'Eligible' },
          { value: 'false', label: 'Not eligible' },
        ]),
      )
      expect(cheerioPage('#erd-eligibility').closest('fieldset').find('legend').text()).toContain(
        'Eligibility for early release',
      )
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

  describe('Field population from inputs', () => {
    const checkedEligibilityValue = (cheerioPage: cheerio.CheerioAPI) =>
      cheerioPage('input[name="erd-eligibility"]:checked').attr('value')

    const textInputs: [string, string, number][] = [
      ['sentence-date-day', 'sentenceDateDay', 14],
      ['sentence-date-month', 'sentenceDateMonth', 5],
      ['sentence-date-year', 'sentenceDateYear', 2026],
      ['sentence-length-months', 'sentenceLengthMonths', 11],
      ['remand-start-date-day', 'remandStartDateDay', 9],
      ['remand-start-date-month', 'remandStartDateMonth', 5],
      ['remand-start-date-year', 'remandStartDateYear', 2026],
      ['tagged-bail-days', 'taggedBailDays', 4],
    ]

    it.each(textInputs)('leaves the %s input empty when there is no previous input', field => {
      const cheerioPage = renderWithCheerio({ formData: {} })
      expect(cheerioPage(`#${field}`).attr('value')).toBeUndefined()
    })

    it.each(textInputs)('fills the %s input from formData.%s', (field, formDataKey, value) => {
      const cheerioPage = renderWithCheerio({ formData: { [formDataKey]: value } })
      expect(cheerioPage(`#${field}`).attr('value')).toBe(String(value))
    })

    it('fills the tagged bail input with 0 when 0 days were entered', () => {
      const cheerioPage = renderWithCheerio({ formData: { taggedBailDays: 0 } })
      expect(cheerioPage('#tagged-bail-days').attr('value')).toBe('0')
    })

    it('keeps the valid inputs filled in when the form is re-rendered with errors', () => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: { sentenceDateDay: 14, sentenceDateYear: 2026, sentenceLengthMonths: 11, taggedBailDays: 4 },
        errorSummary: [{ text: ValidationErrorMessages.InvalidMonth, href: '#sentence-date-month' }],
        errorsByField: { 'sentence-date-month': ValidationErrorMessages.InvalidMonth },
        sentenceDateError: ValidationErrorMessages.InvalidMonth,
      })

      expect(cheerioPage('#sentence-date-day').attr('value')).toBe('14')
      expect(cheerioPage('#sentence-date-month').attr('value')).toBeUndefined()
      expect(cheerioPage('#sentence-date-year').attr('value')).toBe('2026')
      expect(cheerioPage('#sentence-length-months').attr('value')).toBe('11')
      expect(cheerioPage('#tagged-bail-days').attr('value')).toBe('4')
    })

    it('has no ERD eligibility answer selected when there is no previous answer', () => {
      const cheerioPage = renderWithCheerio({ formData: {} })
      expect(checkedEligibilityValue(cheerioPage)).toBeUndefined()
    })

    it.each([
      [true, 'true'],
      [false, 'false'],
    ])('re-selects the previous ERD eligibility answer when erdEligible is %s', (erdEligible, expectedValue) => {
      const cheerioPage = renderWithCheerio({ formData: { erdEligible } })
      expect(checkedEligibilityValue(cheerioPage)).toBe(expectedValue)
    })

    it('keeps the selected ERD eligibility answer when the form is re-rendered with errors', () => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: { erdEligible: false },
        errorSummary: [{ text: ValidationErrorMessages.InvalidDay, href: '#sentence-date-day' }],
        errorsByField: { 'sentence-date-day': ValidationErrorMessages.InvalidDay },
      })

      expect(checkedEligibilityValue(cheerioPage)).toBe('false')
    })
  })

  describe('validation errors', () => {
    it('does not show an error summary or any inline errors when there are no errors', () => {
      const cheerioPage = renderWithCheerio({ isValid: true, formData: {}, errorSummary: [], errorsByField: {} })

      expect(cheerioPage('.govuk-error-summary').length).toBe(0)
      expect(cheerioPage('.govuk-error-message').length).toBe(0)
      expect(cheerioPage('.govuk-input--error').length).toBe(0)
    })

    it('shows every error in the summary, each linking to its field', () => {
      const errorSummary = [
        { text: ValidationErrorMessages.InvalidDay, href: '#sentence-date-day' },
        { text: ValidationErrorMessages.SentenceDurationOutOfRange, href: '#sentence-length-months' },
        { text: ValidationErrorMessages.InvalidTaggedBailDays, href: '#tagged-bail-days' },
      ]

      const cheerioPage = renderWithCheerio({ isValid: false, formData: {}, errorSummary, errorsByField: {} })

      expect(cheerioPage('.govuk-error-summary__title').text()).toContain('There is a problem')
      const summaryLinks = cheerioPage('.govuk-error-summary__list a')
        .toArray()
        .map(link => ({ text: cheerioPage(link).text().trim(), href: cheerioPage(link).attr('href') }))
      expect(summaryLinks).toEqual(errorSummary)
    })

    // the presenter links each error to '#<field>', so every field that can have an error needs that id on the page
    it.each([
      'sentence-date-day',
      'sentence-date-month',
      'sentence-date-year',
      'sentence-length-months',
      'remand-start-date',
      'remand-start-date-day',
      'remand-start-date-month',
      'remand-start-date-year',
      'tagged-bail-days',
      'erd-eligibility',
    ])('has an element with id "%s" for the error summary to link to', field => {
      const cheerioPage = renderWithCheerio({ formData: {} })
      expect(cheerioPage(`#${field}`).length).toBe(1)
    })

    it.each([
      ['sentence-length-months', ValidationErrorMessages.SentenceDurationOutOfRange],
      ['tagged-bail-days', ValidationErrorMessages.InvalidTaggedBailDays],
    ])('shows the inline error against the %s input and highlights it', (field, message) => {
      const cheerioPage = renderWithCheerio({ isValid: false, formData: {}, errorsByField: { [field]: message } })

      expect(cheerioPage(`#${field}-error`).text()).toContain(message)
      expect(cheerioPage(`#${field}`).hasClass('govuk-input--error')).toBe(true)
    })

    it.each([
      ['sentence-date', 'sentenceDateError'],
      ['remand-start-date', 'remandStartDateError'],
    ])('shows one inline error for the %s and highlights only the parts that are wrong', (dateId, dateErrorKey) => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: {},
        errorsByField: {
          [`${dateId}-month`]: ValidationErrorMessages.InvalidMonth,
          [`${dateId}-year`]: ValidationErrorMessages.InvalidYear,
        },
        [dateErrorKey]: ValidationErrorMessages.InvalidMonth,
      })

      expect(cheerioPage(`#${dateId}-error`).text()).toContain(ValidationErrorMessages.InvalidMonth)
      expect(cheerioPage(`#${dateId}-error`).text()).not.toContain(ValidationErrorMessages.InvalidYear)
      expect(cheerioPage(`#${dateId}-day`).hasClass('govuk-input--error')).toBe(false)
      expect(cheerioPage(`#${dateId}-month`).hasClass('govuk-input--error')).toBe(true)
      expect(cheerioPage(`#${dateId}-year`).hasClass('govuk-input--error')).toBe(true)
    })

    it.each([
      'sentence-date-day',
      'sentence-date-month',
      'sentence-date-year',
      'remand-start-date-day',
      'remand-start-date-month',
      'remand-start-date-year',
    ])('highlights the %s input when it has an error', field => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: {},
        errorsByField: { [field]: ValidationErrorMessages.InvalidDay },
      })

      expect(cheerioPage(`#${field}`).hasClass('govuk-input--error')).toBe(true)
    })

    it('shows errors only against the fields that have them', () => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: {},
        errorsByField: { 'tagged-bail-days': ValidationErrorMessages.InvalidTaggedBailDays },
      })

      expect(cheerioPage('.govuk-error-message').length).toBe(1)
      expect(cheerioPage('#sentence-length-months').hasClass('govuk-input--error')).toBe(false)
      expect(cheerioPage('#sentence-date-error').length).toBe(0)
      expect(cheerioPage('#remand-start-date-error').length).toBe(0)
      expect(cheerioPage('#erd-eligibility-error').length).toBe(0)
    })

    it('shows an error summary link and an inline error when no ERD eligibility answer is selected', () => {
      const cheerioPage = renderWithCheerio({
        isValid: false,
        formData: {},
        errorSummary: [{ text: ValidationErrorMessages.MissingErdEligibility, href: '#erd-eligibility' }],
        errorsByField: { 'erd-eligibility': ValidationErrorMessages.MissingErdEligibility },
      })

      const summaryLink = cheerioPage('.govuk-error-summary a[href="#erd-eligibility"]')
      expect(summaryLink.text()).toContain(ValidationErrorMessages.MissingErdEligibility)
      expect(cheerioPage('input#erd-eligibility').attr('name')).toBe('erd-eligibility')
      expect(cheerioPage('#erd-eligibility-error').text()).toContain(ValidationErrorMessages.MissingErdEligibility)
    })
  })
})

import * as cheerio from 'cheerio'
import { ValidationErrorMessages } from '@yjb-platform/shared-types'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import type { FormPageObject } from '../../presenters/dtoFormPresenter'

const env = createNunjucksTestSetup()
const renderPage = (context: Partial<FormPageObject> = {}) =>
  cheerio.load(env.render('pages/new-calculation.njk', context))

// renders the page as the presenter would for an invalid form, with a summary entry for each field error
const renderWithErrors = (errorsByField: Record<string, string>, context: Partial<FormPageObject> = {}) =>
  renderPage({
    isValid: false,
    formData: {},
    errorSummary: Object.entries(errorsByField).map(([field, text]) => ({ text, href: `#${field}` })),
    errorsByField,
    ...context,
  })

describe('New calculation page', () => {
  describe('content', () => {
    it('renders the tab title', () => {
      const cheerioPage = renderPage()
      expect(cheerioPage('title').text()).toBe('Youth Justice Platform - New calculation')
    })

    it('renders the page heading and subheading', () => {
      const cheerioPage = renderPage()
      expect(cheerioPage('h1').text()).toBe('Start a new calculation')
    })

    it('renders the expected text', () => {
      const cheerioPage = renderPage()
      expect(cheerioPage('#instruction-text').text()).toBe(
        'Use this tool to check a Detention and Training Order (DTO) calculation.',
      )
    })
  })

  describe('logic', () => {
    it('contains a calculate button', () => {
      const cheerioPage = renderPage()
      const continueButton = cheerioPage('#calculate-button')
      expect(continueButton.text()).toContain('Calculate')
    })

    it('has a submission form for /calculate', () => {
      const cheerioPage = renderPage()
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

    // the service reads each answer by its input name, so a renamed input would always look unanswered
    it.each([
      ['sentence-date-day', 'Sentence date'],
      ['sentence-date-month', 'Sentence date'],
      ['sentence-date-year', 'Sentence date'],
      ['sentence-length-months', 'Length of sentence'],
      ['remand-start-date-day', 'Remand start date (optional)'],
      ['remand-start-date-month', 'Remand start date (optional)'],
      ['remand-start-date-year', 'Remand start date (optional)'],
      ['tagged-bail-days', 'Tagged bail'],
      ['erd-eligibility', 'Eligibility for early release'],
    ])('includes the %s input under the question "%s"', (name, question) => {
      const cheerioPage = renderPage()

      const input = cheerioPage(`input[name="${name}"]`).first()
      expect(input.attr('id')).toBe(name)

      const fieldset = input.closest('fieldset')
      const questionText = fieldset.length
        ? fieldset.find('legend').first().text()
        : cheerioPage(`label[for="${name}"]`).text()
      expect(questionText).toContain(question)
    })

    it('includes the ERD eligibility input', () => {
      const cheerioPage = renderPage()

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
    })
  })

  describe('field population', () => {
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
      const cheerioPage = renderPage({ formData: {} })
      expect(cheerioPage(`#${field}`).attr('value')).toBeUndefined()
    })

    it.each(textInputs)('fills the %s input from formData.%s', (field, formDataKey, value) => {
      const cheerioPage = renderPage({ formData: { [formDataKey]: value } })
      expect(cheerioPage(`#${field}`).attr('value')).toBe(String(value))
    })

    it('fills the tagged bail input with 0 when 0 days were entered', () => {
      const cheerioPage = renderPage({ formData: { taggedBailDays: 0 } })
      expect(cheerioPage('#tagged-bail-days').attr('value')).toBe('0')
    })

    it('keeps the valid inputs filled in when the form is re-rendered with errors', () => {
      const cheerioPage = renderWithErrors(
        { 'sentence-date-month': ValidationErrorMessages.InvalidMonth },
        {
          formData: {
            sentenceDateDay: 14,
            sentenceDateYear: 2026,
            sentenceLengthMonths: 11,
            taggedBailDays: 4,
            erdEligible: false,
          },
          sentenceDateError: ValidationErrorMessages.InvalidMonth,
        },
      )

      expect(cheerioPage('#sentence-date-day').attr('value')).toBe('14')
      expect(cheerioPage('#sentence-date-month').attr('value')).toBeUndefined()
      expect(cheerioPage('#sentence-date-year').attr('value')).toBe('2026')
      expect(cheerioPage('#sentence-length-months').attr('value')).toBe('11')
      expect(cheerioPage('#tagged-bail-days').attr('value')).toBe('4')
      expect(checkedEligibilityValue(cheerioPage)).toBe('false')
    })

    it('has no ERD eligibility answer selected when there is no previous answer', () => {
      const cheerioPage = renderPage({ formData: {} })
      expect(checkedEligibilityValue(cheerioPage)).toBeUndefined()
    })

    it.each([
      [true, 'true'],
      [false, 'false'],
    ])('re-selects the previous ERD eligibility answer when erdEligible is %s', (erdEligible, expectedValue) => {
      const cheerioPage = renderPage({ formData: { erdEligible } })
      expect(checkedEligibilityValue(cheerioPage)).toBe(expectedValue)
    })
  })

  describe('validation errors', () => {
    it('does not show an error summary or any inline errors when there are no errors', () => {
      const cheerioPage = renderPage({ isValid: true, formData: {}, errorSummary: [], errorsByField: {} })

      expect(cheerioPage('.govuk-error-summary').length).toBe(0)
      expect(cheerioPage('.govuk-error-message').length).toBe(0)
      expect(cheerioPage('.govuk-input--error').length).toBe(0)
    })

    it('does not show the error summary when the page is rendered without isValid', () => {
      const cheerioPage = renderPage({
        formData: {},
        errorSummary: [{ text: ValidationErrorMessages.InvalidDay, href: '#sentence-date-day' }],
      })

      expect(cheerioPage('.govuk-error-summary').length).toBe(0)
    })

    it('shows every error in the summary, each linking to its field', () => {
      const errorSummary = [
        { text: ValidationErrorMessages.InvalidDay, href: '#sentence-date-day' },
        { text: ValidationErrorMessages.SentenceDurationOutOfRange, href: '#sentence-length-months' },
        { text: ValidationErrorMessages.InvalidTaggedBailDays, href: '#tagged-bail-days' },
      ]

      const cheerioPage = renderPage({ isValid: false, formData: {}, errorSummary, errorsByField: {} })

      expect(cheerioPage('.govuk-error-summary__title').text()).toContain('There is a problem')
      const summaryLinks = cheerioPage('.govuk-error-summary__list a')
        .toArray()
        .map(link => ({ text: cheerioPage(link).text().trim(), href: cheerioPage(link).attr('href') }))
      expect(summaryLinks).toEqual(errorSummary)
    })

    // the summary can only move focus to an input, so every field the presenter links to must be one
    it.each([
      'sentence-date-day',
      'sentence-date-month',
      'sentence-date-year',
      'sentence-length-months',
      'remand-start-date-day',
      'remand-start-date-month',
      'remand-start-date-year',
      'tagged-bail-days',
      'erd-eligibility',
    ])('has an input with id "%s" for the error summary to link to', field => {
      const cheerioPage = renderPage({ formData: {} })
      expect(cheerioPage(`input#${field}`).length).toBe(1)
    })

    it.each([
      ['sentence-length-months', ValidationErrorMessages.SentenceDurationOutOfRange, true],
      ['tagged-bail-days', ValidationErrorMessages.InvalidTaggedBailDays, true],
      ['erd-eligibility', ValidationErrorMessages.MissingErdEligibility, false],
    ])('shows the inline error against the %s question and highlights it', (field, message, isTextInput) => {
      const cheerioPage = renderWithErrors({ [field]: message })

      expect(cheerioPage(`#${field}-error`).text()).toContain(message)
      expect(cheerioPage(`#${field}`).closest('.govuk-form-group').hasClass('govuk-form-group--error')).toBe(true)
      // radios have no error border of their own, only text inputs do
      expect(cheerioPage(`#${field}`).hasClass('govuk-input--error')).toBe(isTextInput)
    })

    it.each<[string, 'sentenceDateError' | 'remandStartDateError']>([
      ['sentence-date', 'sentenceDateError'],
      ['remand-start-date', 'remandStartDateError'],
    ])('shows one inline error for the %s and highlights only the parts that are wrong', (dateId, dateErrorKey) => {
      const cheerioPage = renderWithErrors(
        {
          [`${dateId}-month`]: ValidationErrorMessages.InvalidMonth,
          [`${dateId}-year`]: ValidationErrorMessages.InvalidYear,
        },
        { [dateErrorKey]: ValidationErrorMessages.InvalidMonth },
      )

      expect(cheerioPage(`#${dateId}-error`).text()).toContain(ValidationErrorMessages.InvalidMonth)
      expect(cheerioPage(`#${dateId}-error`).text()).not.toContain(ValidationErrorMessages.InvalidYear)
      expect(cheerioPage(`#${dateId}`).closest('.govuk-form-group').hasClass('govuk-form-group--error')).toBe(true)
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
      const cheerioPage = renderWithErrors({ [field]: ValidationErrorMessages.InvalidDay })

      expect(cheerioPage(`#${field}`).hasClass('govuk-input--error')).toBe(true)
    })

    it('shows errors only against the fields that have them', () => {
      const cheerioPage = renderWithErrors({ 'tagged-bail-days': ValidationErrorMessages.InvalidTaggedBailDays })

      expect(cheerioPage('.govuk-error-message').length).toBe(1)
      expect(cheerioPage('#sentence-length-months').hasClass('govuk-input--error')).toBe(false)
      expect(cheerioPage('#sentence-date-error').length).toBe(0)
      expect(cheerioPage('#remand-start-date-error').length).toBe(0)
      expect(cheerioPage('#erd-eligibility-error').length).toBe(0)
    })
  })
})

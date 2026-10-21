import { ValidationErrorMessages } from '@yjb-platform/shared-types'
import DtoFormPresenter from './dtoFormPresenter'
import type { FieldError, ValidationResult } from '../services/dtoService'

const presentErrors = (errors: FieldError[]) =>
  new DtoFormPresenter({ isValid: false, parsedInput: {}, errors }).present()

describe('DtoFormPresenter', () => {
  it('presents a valid result with no errors', () => {
    const validationResult: ValidationResult = {
      isValid: true,
      parsedInput: { sentenceLengthMonths: 6, erdEligible: true },
      errors: [],
    }

    expect(new DtoFormPresenter(validationResult).present()).toEqual({
      isValid: true,
      formData: { sentenceLengthMonths: 6, erdEligible: true },
      errorSummary: [],
      errorsByField: {},
      sentenceDateError: undefined,
      remandStartDateError: undefined,
    })
  })

  it('passes the parsed input through as the form data', () => {
    const parsedInput = { taggedBailDays: 3, sentenceDateDay: 14 }

    const { isValid, formData } = new DtoFormPresenter({
      isValid: false,
      parsedInput,
      errors: [{ field: 'sentence-date-month', message: ValidationErrorMessages.InvalidMonth }],
    }).present()

    expect(isValid).toBe(false)
    expect(formData).toEqual(parsedInput)
  })

  describe('error summary', () => {
    it('links each error to its field, in the order the errors were found', () => {
      const { errorSummary } = presentErrors([
        { field: 'sentence-length-months', message: ValidationErrorMessages.SentenceDurationOutOfRange },
        { field: 'tagged-bail-days', message: ValidationErrorMessages.InvalidTaggedBailDays },
        { field: 'erd-eligibility', message: ValidationErrorMessages.MissingErdEligibility },
      ])

      expect(errorSummary).toEqual([
        { text: ValidationErrorMessages.SentenceDurationOutOfRange, href: '#sentence-length-months' },
        { text: ValidationErrorMessages.InvalidTaggedBailDays, href: '#tagged-bail-days' },
        { text: ValidationErrorMessages.MissingErdEligibility, href: '#erd-eligibility' },
      ])
    })

    it('links the remand before sentence date error to the remand start day input', () => {
      const { errorSummary } = presentErrors([
        { field: 'remand-start-date', message: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate },
      ])

      expect(errorSummary).toEqual([
        { text: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate, href: '#remand-start-date' },
      ])
    })
  })

  describe('errors by field', () => {
    it('keys each error message by its field', () => {
      const { errorsByField } = presentErrors([
        { field: 'sentence-length-months', message: ValidationErrorMessages.SentenceDurationOutOfRange },
        { field: 'remand-start-date-day', message: ValidationErrorMessages.InvalidDay },
      ])

      expect(errorsByField).toEqual({
        'sentence-length-months': ValidationErrorMessages.SentenceDurationOutOfRange,
        'remand-start-date-day': ValidationErrorMessages.InvalidDay,
      })
    })

    it('keeps the remand before sentence date error under its own field, so no date part is highlighted', () => {
      const { errorsByField } = presentErrors([
        { field: 'remand-start-date', message: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate },
      ])

      expect(errorsByField).toEqual({
        'remand-start-date': ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate,
      })
    })
  })

  describe('sentence date error', () => {
    it.each([
      ['sentence-date-day', ValidationErrorMessages.InvalidDay],
      ['sentence-date-month', ValidationErrorMessages.InvalidMonth],
      ['sentence-date-year', ValidationErrorMessages.InvalidYear],
    ])('shows the %s error against the whole date', (field, message) => {
      expect(presentErrors([{ field, message }]).sentenceDateError).toBe(message)
    })

    it('shows only the first error in day, month, year order when several parts are wrong', () => {
      const { sentenceDateError } = presentErrors([
        { field: 'sentence-date-year', message: ValidationErrorMessages.InvalidYear },
        { field: 'sentence-date-month', message: ValidationErrorMessages.InvalidMonth },
      ])

      expect(sentenceDateError).toBe(ValidationErrorMessages.InvalidMonth)
    })

    it('is not set by errors on other fields', () => {
      const { sentenceDateError } = presentErrors([
        { field: 'remand-start-date-day', message: ValidationErrorMessages.InvalidDay },
        { field: 'sentence-length-months', message: ValidationErrorMessages.InvalidSentenceDuration },
      ])

      expect(sentenceDateError).toBeUndefined()
    })
  })

  describe('remand start date error', () => {
    it.each([
      ['remand-start-date-day', ValidationErrorMessages.InvalidDay],
      ['remand-start-date-month', ValidationErrorMessages.InvalidMonth],
      ['remand-start-date-year', ValidationErrorMessages.InvalidYear],
      ['remand-start-date', ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate],
    ])('shows the %s error against the whole date', (field, message) => {
      expect(presentErrors([{ field, message }]).remandStartDateError).toBe(message)
    })

    it('shows the remand before sentence date error ahead of errors on the date parts', () => {
      const { remandStartDateError } = presentErrors([
        { field: 'remand-start-date-day', message: ValidationErrorMessages.InvalidDay },
        { field: 'remand-start-date', message: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate },
      ])

      expect(remandStartDateError).toBe(ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate)
    })

    it('is not set by errors on other fields', () => {
      const { remandStartDateError } = presentErrors([
        { field: 'sentence-date-day', message: ValidationErrorMessages.InvalidDay },
        { field: 'tagged-bail-days', message: ValidationErrorMessages.InvalidTaggedBailDays },
      ])

      expect(remandStartDateError).toBeUndefined()
    })
  })
})

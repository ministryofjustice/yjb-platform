import type { ValidationResult } from '../services/dtoService'

export type FormPageObject = {
  isValid: boolean
  formData: Record<string, unknown>
  errorSummary: { text: string; href: string }[]
  errorsByField: Record<string, string>
  sentenceDateError?: string
  remandStartDateError?: string
}

const sentenceDateFields = ['sentence-date-day', 'sentence-date-month', 'sentence-date-year']
const remandStartDateFields = [
  'remand-start-date',
  'remand-start-date-day',
  'remand-start-date-month',
  'remand-start-date-year',
]

// errors on a whole date have no input of their own, so the summary links to the date's first input
const summaryLinkTargets: Record<string, string> = {
  'remand-start-date': 'remand-start-date-day',
}

export default class DtoFormPresenter {
  constructor(private readonly validationResult: ValidationResult) {}

  present(): FormPageObject {
    const { errors } = this.validationResult
    const errorsByField: Record<string, string> = Object.fromEntries(errors.map(error => [error.field, error.message]))

    return {
      isValid: this.validationResult.isValid,
      formData: this.validationResult.parsedInput,
      errorSummary: errors.map(error => ({
        text: error.message,
        href: `#${summaryLinkTargets[error.field] ?? error.field}`,
      })),
      errorsByField,
      sentenceDateError: sentenceDateFields.map(field => errorsByField[field]).find(Boolean),
      remandStartDateError: remandStartDateFields.map(field => errorsByField[field]).find(Boolean),
    }
  }
}

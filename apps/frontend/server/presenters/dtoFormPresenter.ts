import type { ValidationResult } from '../services/dtoService'

export type FormPageObject = {
  isValid: boolean
  formData: Record<string, unknown>
  errorSummary: { text: string; href: string }[]
  errorsByField: Record<string, string>
  sentenceDateError?: string
}

const sentenceDateFields = ['sentence-date-day', 'sentence-date-month', 'sentence-date-year']

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
        href: `#${error.field}`,
      })),
      errorsByField,
      sentenceDateError: sentenceDateFields.map(field => errorsByField[field]).find(Boolean),
    }
  }
}

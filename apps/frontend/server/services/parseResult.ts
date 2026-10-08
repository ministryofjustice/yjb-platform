import type { ZodType } from 'zod'

// every field is optional as not all fields might parse correctly
export type ParsedDtoForm = {
  remandDays?: number
  taggedBailDays?: number
  sentenceLengthMonths?: number
  sentenceDateDay?: number
  sentenceDateMonth?: number
  sentenceDateYear?: number
  sentenceDate?: Date
  sentenceDateString?: string
}

export type FieldError = { field: string; message: string }

export default class ParseResult {
  input: Record<string, unknown>

  data: ParsedDtoForm

  errors: FieldError[]

  constructor(input: Record<string, unknown>, data: ParsedDtoForm, errors: FieldError[]) {
    this.input = input
    this.data = data
    this.errors = errors
  }

  processFormField<K extends keyof ParsedDtoForm>(
    formFieldRaw: unknown,
    schema: ZodType<ParsedDtoForm[K]>,
    formFieldName: string,
    formFieldPropertyName: K,
  ) {
    if (formFieldRaw !== undefined) {
      const result = schema.safeParse(formFieldRaw)
      if (result.success) {
        this.data[formFieldPropertyName] = result.data
      } else {
        this.errors.push({ field: formFieldName, message: result.error.issues[0].message })
      }
    }
  }

  get success(): boolean {
    return this.errors.length === 0
  }
}

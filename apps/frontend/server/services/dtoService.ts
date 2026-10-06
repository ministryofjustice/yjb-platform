import {
  InputIndividualSentence,
  InputSentences,
  OutputCalculation,
  RemandAdjustment,
  dtoDurationMonthsSchema,
  dtoRemandDaysSchema,
  dtoTaggedBailDaysSchema,
  sentenceDateStringSchema,
  sentenceDateDaySchema,
  sentenceDateMonthSchema,
  sentenceDateYearSchema,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'

export type ValidationResult = {
  isValid: boolean
  input: Record<string, unknown>
  parsedInput: ParsedDtoForm
  payload?: InputSentences
  errors: FieldError[]
}

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

type ParseResult = {
  success: boolean
  input: Record<string, unknown>
  data: ParsedDtoForm
  errors: FieldError[]
}

// optional fields same like ParsedDtoForm, not all fields will be always parsed
type ParsedDate = {
  day?: number
  month?: number
  year?: number
  sentenceDate?: Date
  errors: FieldError[]
}

function parseDate(day: unknown, month: unknown, year: unknown): ParsedDate {

  // no need to parse date if fields are empty
  const hasAnyDateField = day !== undefined || month !== undefined || year !== undefined
  if (!hasAnyDateField) {
    return { errors: [] }
  }

  const errors: FieldError[] = []

  const dayResult = sentenceDateDaySchema.safeParse(day)
  if (!dayResult.success) {
    errors.push({ field: 'sentence-date-day', message: dayResult.error.issues[0].message })
  }

  const monthResult = sentenceDateMonthSchema.safeParse(month)
  if (!monthResult.success) {
    errors.push({ field: 'sentence-date-month', message: monthResult.error.issues[0].message })
  }

  const yearResult = sentenceDateYearSchema.safeParse(year)
  if (!yearResult.success) {
    errors.push({ field: 'sentence-date-year', message: yearResult.error.issues[0].message })
  }

  // a combined date only makes sense once all three parts are valid
  const sentenceDate =
    dayResult.success && monthResult.success && yearResult.success
      ? new Date(Date.UTC(yearResult.data, monthResult.data - 1, dayResult.data))
      : undefined

  return {
    day: dayResult.success ? dayResult.data : undefined,
    month: monthResult.success ? monthResult.data : undefined,
    year: yearResult.success ? yearResult.data : undefined,
    sentenceDate,
    errors,
  }
}

function parseDtoForm(formData: Record<string, unknown>): ParseResult {
  const { day, month, year, sentenceDate, errors: dateErrors } = parseDate(
    formData['sentence-date-day'],
    formData['sentence-date-month'],
    formData['sentence-date-year'],
  )

  const errors: FieldError[] = [...dateErrors]
  const data: ParsedDtoForm = {
    sentenceDateDay: day,
    sentenceDateMonth: month,
    sentenceDateYear: year,
  }

  if (sentenceDate) {
    data.sentenceDate = sentenceDate
    data.sentenceDateString = sentenceDateStringSchema
      .catch('Invalid Date')
      .parse(sentenceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }))
  }

  // evaluate all fields individually and either push err or parsed field
  if (formData['sentence-length-months'] !== undefined) {
    const result = dtoDurationMonthsSchema.safeParse(formData['sentence-length-months'])
    if (result.success) {
      data.sentenceLengthMonths = result.data
    } else {
      errors.push({ field: 'sentence-length-months', message: result.error.issues[0].message })
    }
  }

  if (formData['remand-days'] !== undefined) {
    const result = dtoRemandDaysSchema.safeParse(formData['remand-days'])
    if (result.success) {
      data.remandDays = result.data
    } else {
      errors.push({ field: 'remand-days', message: result.error.issues[0].message })
    }
  }

  if (formData['tagged-bail-days'] !== undefined) {
    const result = dtoTaggedBailDaysSchema.safeParse(formData['tagged-bail-days'])
    if (result.success) {
      data.taggedBailDays = result.data
    } else {
      errors.push({ field: 'tagged-bail-days', message: result.error.issues[0].message })
    }
  }

  return {
    success: errors.length === 0,
    input: formData,
    data,
    errors,
  }
}

function constructInputSentences(parsed: ParsedDtoForm): InputSentences {
  // startDate is intentionally omitted - the API derives it from the sentence
  // start date and remand day count when it isn't supplied (see parseInputSentences)
  const remandAdjustment: RemandAdjustment =
    parsed.remandDays > 0 ? { name: 'remand', days: parsed.remandDays } : undefined

  const taggedBailAdjustment =
    parsed.taggedBailDays > 0 ? { name: 'taggedBail' as const, days: parsed.taggedBailDays } : undefined

  const inputIndividualSentences: InputIndividualSentence[] =
    parsed.sentenceLengthMonths > 0 ? [{ from: parsed.sentenceDate, durationMonths: parsed.sentenceLengthMonths }] : []

  return {
    offenderName: 'John Doe',
    remandAdjustment,
    taggedBailAdjustment,
    inputIndividualSentences,
  }
}

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(formData: Record<string, unknown>): ValidationResult {
    const parseResult = parseDtoForm(formData)

    // TODO: replace bellow line with a proper business validation function
    const isValid =
      parseResult.success &&
      Number.isInteger(parseResult.data.sentenceLengthMonths) &&
      parseResult.data.sentenceLengthMonths > 0

    return {
      isValid,
      input: parseResult.input,
      parsedInput: parseResult.data,
      errors: parseResult.errors,
      payload: isValid ? constructInputSentences(parseResult.data) : undefined,
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

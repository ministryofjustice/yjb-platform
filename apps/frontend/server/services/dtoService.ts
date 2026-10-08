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
  ValidationErrorMessages,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'
import ParseResult, { FieldError, ParsedDtoForm } from './parseResult'

export type { FieldError, ParsedDtoForm }

export type ValidationResult = {
  isValid: boolean
  parsedInput: ParsedDtoForm
  payload?: InputSentences
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
  const parsedDateResult: ParsedDate = { errors: [] }

  const dateFieldIsMissing = day === undefined && month === undefined && year === undefined
  if (!dateFieldIsMissing) {
    const dayResult = sentenceDateDaySchema.safeParse(day)
    if (!dayResult.success) {
      parsedDateResult.errors.push({ field: 'sentence-date-day', message: dayResult.error.issues[0].message })
    } else {
      parsedDateResult.day = dayResult.data
    }

    const monthResult = sentenceDateMonthSchema.safeParse(month)
    if (!monthResult.success) {
      parsedDateResult.errors.push({ field: 'sentence-date-month', message: monthResult.error.issues[0].message })
    } else {
      parsedDateResult.month = monthResult.data
    }

    const yearResult = sentenceDateYearSchema.safeParse(year)
    if (!yearResult.success) {
      parsedDateResult.errors.push({ field: 'sentence-date-year', message: yearResult.error.issues[0].message })
    } else {
      parsedDateResult.year = yearResult.data
    }

    // a combined date only makes sense once all three parts are valid
    parsedDateResult.sentenceDate =
      dayResult.success && monthResult.success && yearResult.success
        ? new Date(Date.UTC(yearResult.data, monthResult.data - 1, dayResult.data))
        : undefined
  }

  return parsedDateResult
}

function parseDtoForm(formData: Record<string, unknown>): ParseResult {
  const dateResult = parseDate(
    formData['sentence-date-day'],
    formData['sentence-date-month'],
    formData['sentence-date-year'],
  )

  const parseResult: ParseResult = new ParseResult(
    formData,
    {
      sentenceDateDay: dateResult.day,
      sentenceDateMonth: dateResult.month,
      sentenceDateYear: dateResult.year,
    },
    [...dateResult.errors],
  )

  if (dateResult.sentenceDate) {
    parseResult.data.sentenceDate = dateResult.sentenceDate
    parseResult.data.sentenceDateString = sentenceDateStringSchema
      .catch('Invalid Date')
      .parse(dateResult.sentenceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }))
  }

  // evaluate all fields individually and either push err or parsed field
  parseResult.processFormField(
    formData['sentence-length-months'],
    dtoDurationMonthsSchema,
    'sentence-length-months',
    'sentenceLengthMonths',
  )

  parseResult.processFormField(formData['remand-days'], dtoRemandDaysSchema, 'remand-days', 'remandDays')

  parseResult.processFormField(
    formData['tagged-bail-days'],
    dtoTaggedBailDaysSchema,
    'tagged-bail-days',
    'taggedBailDays',
  )

  return parseResult
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
    const parseResult: ParseResult = parseDtoForm(formData)
    const { sentenceLengthMonths } = parseResult.data

    // TODO: replace this with a proper business validation function
    let isBusinessValid = false
    if (sentenceLengthMonths !== undefined) {
      if (sentenceLengthMonths >= 4 && sentenceLengthMonths <= 24) {
        isBusinessValid = true
      } else {
        parseResult.errors.push({
          field: 'sentence-length-months',
          message: ValidationErrorMessages.SentenceDurationOutOfRange,
        })
      }
    }

    const isValid = parseResult.success && isBusinessValid

    return {
      isValid,
      parsedInput: parseResult.data,
      errors: parseResult.errors,
      payload: isValid ? constructInputSentences(parseResult.data) : undefined,
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

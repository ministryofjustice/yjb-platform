import {
  InputIndividualSentence,
  InputSentences,
  OutputCalculation,
  RemandAdjustment,
  dtoDurationMonthsSchema,
  dtoTaggedBailDaysSchema,
  sentenceDateDaySchema,
  sentenceDateMonthSchema,
  sentenceDateYearSchema,
  ValidationErrorMessages,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'
import { toDateString } from '../utils/dateUtils'
import DtoParseResult, { FieldError, ParsedDtoForm } from './helpers/dtoParseResult'

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
  constructedDate?: Date
  errors: FieldError[]
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === ''
}

// this method is processing both sentence date and remand date in the same fashion
function parseDate(fieldPrefix: string, day: unknown, month: unknown, year: unknown, isOptional = false): ParsedDate {
  const parsedDateResult: ParsedDate = { errors: [] }

  const isWholeFieldEmpty = isEmpty(day) && isEmpty(month) && isEmpty(year)
  if (isOptional && isWholeFieldEmpty) {
    return parsedDateResult
  }

  const dayResult = sentenceDateDaySchema.safeParse(day)
  if (!dayResult.success) {
    parsedDateResult.errors.push({ field: `${fieldPrefix}-day`, message: dayResult.error.issues[0].message })
  } else {
    parsedDateResult.day = dayResult.data
  }

  const monthResult = sentenceDateMonthSchema.safeParse(month)
  if (!monthResult.success) {
    parsedDateResult.errors.push({ field: `${fieldPrefix}-month`, message: monthResult.error.issues[0].message })
  } else {
    parsedDateResult.month = monthResult.data
  }

  const yearResult = sentenceDateYearSchema.safeParse(year)
  if (!yearResult.success) {
    parsedDateResult.errors.push({ field: `${fieldPrefix}-year`, message: yearResult.error.issues[0].message })
  } else {
    parsedDateResult.year = yearResult.data
  }

  // a combined date only makes sense once all three parts are valid
  parsedDateResult.constructedDate =
    dayResult.success && monthResult.success && yearResult.success
      ? new Date(Date.UTC(yearResult.data, monthResult.data - 1, dayResult.data))
      : undefined

  return parsedDateResult
}

function parseDtoForm(formData: Record<string, unknown>): DtoParseResult {
  const dateResult = parseDate(
    'sentence-date',
    formData['sentence-date-day'],
    formData['sentence-date-month'],
    formData['sentence-date-year'],
  )

  const remandStartDateResult = parseDate(
    'remand-start-date',
    formData['remand-start-date-day'],
    formData['remand-start-date-month'],
    formData['remand-start-date-year'],
    true,
  )

  const parseResult: DtoParseResult = new DtoParseResult(
    formData,
    {
      sentenceDateDay: dateResult.day,
      sentenceDateMonth: dateResult.month,
      sentenceDateYear: dateResult.year,
      remandStartDateDay: remandStartDateResult.day,
      remandStartDateMonth: remandStartDateResult.month,
      remandStartDateYear: remandStartDateResult.year,
    },
    [...dateResult.errors, ...remandStartDateResult.errors],
  )

  if (dateResult.constructedDate) {
    parseResult.data.sentenceDate = dateResult.constructedDate
    parseResult.data.sentenceDateString = toDateString(dateResult.constructedDate)
  }

  if (remandStartDateResult.constructedDate) {
    parseResult.data.remandStartDate = remandStartDateResult.constructedDate
    parseResult.data.remandStartDateString = toDateString(remandStartDateResult.constructedDate)
  }

  // evaluate all fields individually and either push err or parsed field
  parseResult.processFormField(
    formData['sentence-length-months'],
    dtoDurationMonthsSchema,
    'sentence-length-months',
    'sentenceLengthMonths',
  )

  parseResult.processFormField(
    formData['tagged-bail-days'],
    dtoTaggedBailDaysSchema,
    'tagged-bail-days',
    'taggedBailDays',
  )

  return parseResult
}

function constructInputSentences(parsed: ParsedDtoForm): InputSentences {
  // the API works out the days on remand from the remand start date and the sentence date
  const remandAdjustment: RemandAdjustment = parsed.remandStartDate
    ? { name: 'remand', startDate: parsed.remandStartDate }
    : undefined

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

// rules that need more than one field, checked once every field has been parsed
function businessRuleErrors({ sentenceLengthMonths, sentenceDate, remandStartDate }: ParsedDtoForm): FieldError[] {
  const errors: FieldError[] = []

  if (sentenceLengthMonths !== undefined && (sentenceLengthMonths < 4 || sentenceLengthMonths > 24)) {
    errors.push({ field: 'sentence-length-months', message: ValidationErrorMessages.SentenceDurationOutOfRange })
  }

  if (sentenceDate && remandStartDate && remandStartDate >= sentenceDate) {
    errors.push({ field: 'remand-start-date', message: ValidationErrorMessages.RemandStartDateNotBeforeSentenceDate })
  }

  return errors
}

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(formData: Record<string, unknown>): ValidationResult {
    const parseResult: DtoParseResult = parseDtoForm(formData)
    parseResult.errors.push(...businessRuleErrors(parseResult.data))

    // a sentence length is required - a missing one has no field error yet, but can't be calculated
    const isValid = parseResult.success && parseResult.data.sentenceLengthMonths !== undefined

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

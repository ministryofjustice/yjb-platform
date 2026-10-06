import {
  InputIndividualSentence,
  InputSentences,
  OutputCalculation,
  RemandAdjustment,
  dtoFormSchema,
  sentenceDateStringSchema,
  sentenceDateDaySchema,
  sentenceDateMonthSchema,
  sentenceDateYearSchema,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'

export type ValidationResult = {
  isValid: boolean
  input: Record<string, unknown>
  parsedInput?: ParsedDtoForm
  payload?: InputSentences
  errors?: FieldError[]
}

export type ParsedDtoForm = {
  remandDays: number
  taggedBailDays: number
  sentenceLengthMonths: number
  sentenceDate: Date
  sentenceDateString: string
}

export type FieldError = { field: string; message: string }

type ParseResult = {
  success: boolean
  input: Record<string, unknown>
  data?: ParsedDtoForm
  errors: FieldError[]
}

function parseDate(day: unknown, month: unknown, year: unknown): { sentenceDate: Date; errors: FieldError[] } {
  const hasDateFields = day !== undefined && month !== undefined && year !== undefined

  const errors: FieldError[] = []

  if (hasDateFields) {
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
  }

  // only assemble the date when there's something to assemble it from
  const sentenceDate = hasDateFields ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))) : new Date(NaN)

  return { sentenceDate, errors }
}

function parseDtoForm(formData: Record<string, unknown>): ParseResult {
  const { sentenceDate, errors: dateErrors } = parseDate(
    formData['sentence-date-day'],
    formData['sentence-date-month'],
    formData['sentence-date-year'],
  )

  const result = dtoFormSchema.safeParse({
    from: sentenceDate,
    durationMonths: formData['sentence-length-months'],
    remandDays: formData['remand-days'],
    remandStartDate: formData['remand-start-date'],
    taggedBailDays: formData['tagged-bail-days'],
  })

  const schemaErrors: FieldError[] = result.success ? [] : 
  result.error.issues.map(issue => ({
    field: String(issue.path[0]),
    message: issue.message,
  }))

  const errors = [...dateErrors, ...schemaErrors]
  const success = result.success && dateErrors.length === 0

  const data: ParsedDtoForm = !success
    ? null
    : {
        remandDays: result.data.remandDays,
        taggedBailDays: result.data.taggedBailDays,
        sentenceLengthMonths: result.data.durationMonths,
        sentenceDate: result.data.from,
        sentenceDateString: sentenceDateStringSchema
          .catch('Invalid Date')
          .parse(result.data.from.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })),
      }

  return {
    success,
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
      parsedInput: isValid ? parseResult.data : undefined,
      errors: parseResult.success ? [] : parseResult.errors,
      payload: isValid ? constructInputSentences(parseResult.data) : undefined,
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

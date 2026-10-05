import {
  InputIndividualSentence,
  InputSentences,
  OutputCalculation,
  RemandAdjustment,
  dtoFormSchema,
  sentenceDateStringSchema,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'

export type ValidationResult = {
  isValid: boolean
  input: Record<string, unknown>
  parsedInput?: ParsedDtoForm
  payload?: InputSentences
}

export type ParsedDtoForm = {
  remandDays: number
  taggedBailDays: number
  sentenceLengthMonths: number
  sentenceDate: Date
  sentenceDateString: string
}

function parseDtoForm(formData: Record<string, unknown>): ParsedDtoForm {
  const hasDateFields =
    formData['sentence-date-year'] !== undefined &&
    formData['sentence-date-month'] !== undefined &&
    formData['sentence-date-day'] !== undefined

  // only assemble the date when there's something to assemble it from 
  const sentenceDate = hasDateFields
    ? new Date(
        Date.UTC(
          Number(formData['sentence-date-year']),
          Number(formData['sentence-date-month']) - 1,
          Number(formData['sentence-date-day']),
        ),
      )
    : new Date(NaN)

  const parsed = dtoFormSchema.parse({
    from: sentenceDate,
    durationMonths: formData['sentence-length-months'],
    remandDays: formData['remand-days'],
    remandStartDate: formData['remand-start-date'],
    taggedBailDays: formData['tagged-bail-days'],
  })

  // turn the already parsed date to string 
  const sentenceDateString = sentenceDateStringSchema
    .catch('Invalid Date')
    .parse(parsed.from.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }))

  return {
    remandDays: parsed.remandDays,
    taggedBailDays: parsed.taggedBailDays,
    sentenceLengthMonths: parsed.durationMonths,
    sentenceDate: parsed.from,
    sentenceDateString,
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
    offenderName: 'William Gates',
    remandAdjustment,
    taggedBailAdjustment,
    inputIndividualSentences,
  }
}

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(formData: Record<string, unknown>): ValidationResult {
    const parsedDtoForm = parseDtoForm(formData)
    const isValid = Number.isInteger(parsedDtoForm.sentenceLengthMonths) && parsedDtoForm.sentenceLengthMonths > 0
    return {
      isValid,
      input: formData,
      parsedInput: isValid ? parsedDtoForm : undefined,
      payload: isValid ? constructInputSentences(parsedDtoForm) : undefined,
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

import {
  InputIndividualSentence,
  InputSentences,
  OutputCalculation,
  RemandAdjustment,
} from '@yjb-platform/shared-types'
import YjbApiClient from '../data/yjbApi'

export type ValidationResult = {
  isValid: boolean
  input: Record<string, unknown>
  parsedInput?: ParsedDtoForm
  payload?: InputSentences
  errors?: Record<string, string>
}

export type ParsedDtoForm = {
  remandDays: number
  taggedBailDays: number
  sentenceLengthMonths: number
  sentenceDate: Date
  sentenceDateString: string
}

export function parseDtoForm(formData: Record<string, unknown>): ParsedDtoForm {
  const badDate = (
    Number.isInteger(formData['sentence-date-year'])
    && Number.isInteger(formData['sentence-date-month']) && Number(formData['sentence-date-month']) < 13 && Number(formData['sentence-date-month']) > 0
    && Number.isInteger(formData['sentence-date-day']) && Number(formData['sentence-date-day']) < 32 && Number(formData['sentence-date-day']) > 0
  ) ? false : true
  const sentenceDate: Date = badDate ? undefined : new Date(
  Date.UTC(
      Number(formData['sentence-date-year']),
      Number(formData['sentence-date-month']) - 1,
      Number(formData['sentence-date-day']),
    ),
  )
  return {
    remandDays: formData['remand-days'] !== undefined ? Number(formData['remand-days']) : 0,
    taggedBailDays: formData['tagged-bail-days'] !== undefined ? Number(formData['tagged-bail-days']) : 0,
    sentenceLengthMonths:
      formData['sentence-length-months'] !== undefined ? Number(formData['sentence-length-months']) : -1,
    sentenceDate: badDate ? undefined : sentenceDate,
    sentenceDateString: badDate ? undefined : sentenceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  }
}

function constructInputSentences(parsed: ParsedDtoForm): InputSentences {
  const remandAdjustment: RemandAdjustment =
    parsed.remandDays > 0 ? { name: 'remand', startDate: new Date(), days: parsed.remandDays } : undefined

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
    const errorMessages: Record<string, string> = {}

    const parsedDtoForm = parseDtoForm(formData)
    const { sentenceLengthMonths, remandDays } = parsedDtoForm

    if (!Number.isInteger(sentenceLengthMonths) || sentenceLengthMonths < 4) {
      errorMessages["sentenceLengthMonths"] = "Sentence length must be a whole number of 4 months or more"
    }

    if (!Number.isInteger(remandDays) || remandDays < 0) {
      errorMessages["remandDays"] = "Remand days must be a whole number of 0 days or more"
    }

    // const isValid = Number.isInteger(parsedDtoForm.sentenceLengthMonths) && parsedDtoForm.sentenceLengthMonths > 0
    const isValid = Object.keys(errorMessages).length === 0
    return {
      isValid,
      input: formData,
      parsedInput: isValid ? parsedDtoForm : undefined,
      payload: isValid ? constructInputSentences(parsedDtoForm) : undefined,
      errors: isValid ? undefined : errorMessages
      // payload: constructInputSentences(parsedDtoForm),
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

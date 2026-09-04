import YjbApiClient from '../data/yjbApi'
import { InputIndividualSentence, InputSentences, OutputCalculation, RemandAdjustment } from '../types/dtoTypes'

export type ValidationResult = {
  isValid: boolean
  input: Record<string, unknown>
  payload?: InputSentences
}

type ParsedDtoForm = {
  remandDays: number
  taggedBailDays: number
  sentenceLengthMonths: number
  sentenceDate: Date
}

function parseDtoForm(formData: Record<string, unknown>): ParsedDtoForm {
  return {
    remandDays: formData['remand-days'] !== undefined ? Number(formData['remand-days']) : 0,
    taggedBailDays: formData['tagged-bail-days'] !== undefined ? Number(formData['tagged-bail-days']) : 0,
    sentenceLengthMonths:
      formData['sentence-length-months'] !== undefined ? Number(formData['sentence-length-months']) : 0,
    sentenceDate: new Date(
      Number(formData['sentence-date-year']),
      Number(formData['sentence-date-month']) - 1,
      Number(formData['sentence-date-day']),
    ),
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
    const parsedDtoForm = parseDtoForm(formData)
    const isValid = Number.isInteger(parsedDtoForm.sentenceLengthMonths) && parsedDtoForm.sentenceLengthMonths > 0
    return {
      isValid,
      input: formData,
      payload: isValid ? constructInputSentences(parsedDtoForm) : undefined,
    }
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

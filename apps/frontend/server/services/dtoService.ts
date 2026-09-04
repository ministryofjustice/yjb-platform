import YjbApiClient from '../data/yjbApi'
import { InputIndividualSentence, InputSentences, OutputCalculation, RemandAdjustment } from '../types/dtoTypes'

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(formData: Record<string, unknown>): InputSentences {
    const remandDaysInput: number = formData['remand-days'] !== undefined ? (formData['remand-days'] as number) : 0

    const taggedBailDaysInput: number =
      formData['tagged-bail-days'] !== undefined ? (formData['tagged-bail-days'] as number) : 0

    const sentenceLengthMonthsInput: number =
      formData['sentence-length-months'] !== undefined ? (formData['sentence-length-months'] as number) : 0

    const remandAdjustment: RemandAdjustment =
      remandDaysInput > 0
        ? {
            name: 'remand',
            startDate: new Date(),
            days: remandDaysInput,
          }
        : undefined

    const taggedBailAdjustment =
      taggedBailDaysInput > 0
        ? {
            name: 'taggedBail' as const,
            days: taggedBailDaysInput,
          }
        : undefined

    const sentenceDate = new Date(
      Number(formData['sentence-date-year']),
      Number(formData['sentence-date-month']) - 1,
      Number(formData['sentence-date-day']),
    )

    const inputIndividualSentences: InputIndividualSentence[] =
      sentenceLengthMonthsInput > 0 ? [{ from: sentenceDate, durationMonths: sentenceLengthMonthsInput }] : []

    const result: InputSentences = {
      offenderName: 'William Gates',
      remandAdjustment,
      taggedBailAdjustment,
      inputIndividualSentences,
    }
    return result
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

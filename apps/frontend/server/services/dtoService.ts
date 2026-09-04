import YjbApiClient from '../data/yjbApi'
import { InputSentences, OutputCalculation, RemandAdjustment } from '../types/dtoTypes'

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(formData: Record<string, unknown>): InputSentences {
    const remandDaysInput: number = formData['remand-days'] !== undefined ? (formData['remand-days'] as number) : 0

    const remandAdjustment: RemandAdjustment =
      remandDaysInput > 0
        ? {
            name: 'remand',
            startDate: new Date(),
            days: remandDaysInput,
          }
        : undefined

    const taggedBailDaysInput: number =
      formData['tagged-bail-days'] !== undefined ? (formData['tagged-bail-days'] as number) : 0

    const taggedBailAdjustment =
      taggedBailDaysInput > 0
        ? {
            name: 'taggedBail' as const,
            days: taggedBailDaysInput,
          }
        : undefined

    const result: InputSentences = {
      offenderName: 'William Gates',
      remandAdjustment,
      taggedBailAdjustment,
      inputIndividualSentences: [],
    }
    return result
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

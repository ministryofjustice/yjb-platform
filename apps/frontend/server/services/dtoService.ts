import YjbApiClient from '../data/yjbApi'
import { InputSentences, OutputCalculation } from '../types/dtoTypes'

export default class DtoService {
  constructor(private readonly yjbApiClient: YjbApiClient) {}

  validatePayload(_formData: object): InputSentences {
    const fakeOutput: InputSentences = {
      offenderName: 'William Gates',
      inputIndividualSentences: [],
    }
    return fakeOutput
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    return this.yjbApiClient.calculateDtoSentence(payload)
  }
}

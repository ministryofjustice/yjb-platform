import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'
import { SentencePayload } from '../types/sentencePayload.tx'
import { CalculationResult } from '../types/calculationResult'

export default class YjbApiClient extends RestClient {
  constructor() {
    super('yjb-api', config.apis.yjbApi, logger, { getToken: async () => '' })
  }

  async getTestApiData() {
    return this.get({ path: '/test-api' })
  }

  async calculateDtoSentence(payload: SentencePayload): Promise<CalculationResult> {
    return this.post({ path: '/calculate-dto', data: { payload } })
  }
}

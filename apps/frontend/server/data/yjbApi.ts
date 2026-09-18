import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import { InputSentences, OutputCalculation } from '@yjb-platform/shared-types'
import logger from '../../logger'
import config from '../config'

export default class YjbApiClient extends RestClient {
  constructor() {
    super('yjb-api', config.apis.yjbApi, logger, { getToken: async () => '' })
  }

  async getTestApiData() {
    return this.get({ path: '/test-api' })
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    const result: Promise<OutputCalculation> = this.post({ path: '/calculations', data: payload })

    return result
  }
}

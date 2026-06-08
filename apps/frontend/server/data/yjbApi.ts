import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export default class YjbApiClient extends RestClient {
  constructor() {
    super('yjb-api', config.apis.yjbApi, logger, { getToken: async () => '' })
  }

  async getTestApiData() {
    return this.get({ path: '/test-api' })
  }
}

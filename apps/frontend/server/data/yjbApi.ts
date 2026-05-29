import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'

export default class YjbApiClient extends RestClient {
  constructor() {
    super(
      'yjb-api',
      {
        //the client works with both Docker via API_URL or locally
        url: config.apis.yjbApi.url,
        // timeout:  config.apis.yjbApi.timeout,
        // agent: { maxSockets: 100 },
      } as ApiConfig,
      console, // Replace with a proper logger in production
    //   {
    //     getToken: async () => 'your-system-token', // Replace with a token management strategy
    //   },
    )
  }

   async getTestApiData() {
    const username = 'anonymous'
    return this.get({ path: '/test-api' }, asSystem(username))
  }

}

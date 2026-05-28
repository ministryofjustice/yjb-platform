import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'

class YjbApiClient extends RestClient {
  constructor() {
    super(
      'yjb-api',
      {
        //the client works with both Docker via API_URL or locally
        url: process.env.API_URL || 'http://localhost:3001',
        timeout: {
          response: 5000,
          deadline: 10000,
        },
        agent: { maxSockets: 100 },
      } as ApiConfig,
      console, // Replace with a proper logger in production
      {
        getToken: async () => 'your-system-token', // Replace with a token management strategy
      },
    )
  }

   async getTestApiData() {
    const username = 'anonymous'
    return this.get({ path: '/test-api' }, asSystem(username))
  }

}

export default new YjbApiClient()
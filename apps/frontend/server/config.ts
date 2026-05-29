import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }


export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'YJB_UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  staticResourceCacheDuration: '1h',
  environmentName: get('ENVIRONMENT_NAME', ''),
  apis: {
     yjbApi: {
      url: get('API_URL', 'http://localhost:3001', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('EXAMPLE_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('EXAMPLE_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('EXAMPLE_API_TIMEOUT_RESPONSE', 5000))),
    },
  }
}

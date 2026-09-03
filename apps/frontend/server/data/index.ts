/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */

import applicationInfoSupplier from '../applicationInfo'
import YjbApiClient from './yjbApi'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => {
  return {
    applicationInfo,
    yjbApiClient: new YjbApiClient(),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

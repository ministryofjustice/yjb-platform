import fs from 'fs'
import path from 'path'

export type ApplicationInfo = {
  applicationName: string
  buildNumber: string
  gitRef: string
  productId: string
  branchName: string
}

export default (): ApplicationInfo => {
  const { name: applicationName } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString())
  return {
    applicationName,
    buildNumber: process.env.BUILD_NUMBER ?? '1_0_0',
    gitRef: process.env.GIT_REF ?? 'unknown',
    productId: process.env.PRODUCT_ID ?? 'YJB_UNASSIGNED',
    branchName: process.env.GIT_BRANCH ?? 'unknown',
  }
}

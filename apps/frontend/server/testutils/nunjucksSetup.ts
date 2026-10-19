import nunjucks from 'nunjucks'
import path from 'path'
import { initialiseName } from '../utils/utils'
import { toDateString } from '../utils/dateUtils'

export default function createNunjucksTestSetup(): nunjucks.Environment {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([
      path.resolve(__dirname, '../views'),
      path.resolve(__dirname, '../../../../node_modules/govuk-frontend/dist/'),
      path.resolve(__dirname, '../../../../node_modules/@ministryofjustice/frontend/'),
    ]),
  )

  env.addGlobal('applicationName', 'Youth Justice Platform')
  env.addFilter('assetMap', (url: string) => url)
  env.addFilter('initialiseName', initialiseName)
  env.addFilter('toDateString', (date?: Date | string) => (date ? toDateString(date) : ''))

  return env
}

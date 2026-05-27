import express, { Application } from 'express'
import routes from './routes'
import type { ApplicationInfo } from './applicationInfo'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'

export default function createApp(applicationInfo: ApplicationInfo): Application {
  const app = express()

  app.set('port', process.env.PORT || 3001)

  app.use(setUpHealthChecks(applicationInfo))
  app.use(setUpWebRequestParsing())
  app.use(routes())

  return app
}

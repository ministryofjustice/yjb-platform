import express, { Express } from 'express'
import { NotFound } from 'http-errors'
import routes from '../index'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import ExampleService from '../../services/exampleService'

export const user = { username: 'user1' }

function appSetup(services: Services, production: boolean): Express {
  const app = express()

  app.use((_req, res, next) => {
    res.locals.user = user
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((_req, _res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {
    exampleService: new ExampleService() as jest.Mocked<ExampleService>,
  },
}: {
  production?: boolean
  services?: Partial<Services>
} = {}): Express {
  return appSetup(services as Services, production)
}

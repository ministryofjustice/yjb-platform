import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const staticResourcesConfig = { maxAge: config.staticResourceCacheDuration, redirect: false }

  const nodeModules = path.resolve(process.cwd(), '../../node_modules')

  Array.of(
    path.join(process.cwd(), 'dist/assets'),
    path.join(nodeModules, 'govuk-frontend/dist/govuk/assets'),
    path.join(nodeModules, 'govuk-frontend/dist'),
    path.join(nodeModules, '@ministryofjustice/frontend/moj/assets'),
    path.join(nodeModules, '@ministryofjustice/frontend'),
  ).forEach(dir => {
    router.use('/assets', express.static(dir, staticResourcesConfig))
  })

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}

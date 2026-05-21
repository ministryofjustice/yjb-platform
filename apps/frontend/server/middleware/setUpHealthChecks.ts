import express, { Router } from 'express'

import type { ApplicationInfo } from '../applicationInfo'
import config from '../config'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  //perform health checks here

  return router
}

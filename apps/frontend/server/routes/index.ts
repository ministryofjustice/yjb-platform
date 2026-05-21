import { Router } from 'express'

import type { Services } from '../services'

export default function routes({ exampleService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const currentTime = await exampleService.getCurrentTime()
    //  return res.render('pages/index', { currentTime }) //implement pages once default view engine is added
    return res.send(`<h1>Hello World</h1><p>The time is currently ${currentTime} obtained via our dummy service</p>`)
  })

  return router
}

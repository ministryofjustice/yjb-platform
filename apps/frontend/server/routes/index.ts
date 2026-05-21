import { Router } from 'express'
import type { Services } from '../services'

export default function routes({ exampleService }: Services): Router {
  const router = Router()
  
  router.get('/', async (req, res, _next) => {
    const currentTime = exampleService.getCurrentTime()
    return res.render('pages/index', { currentTime })  
  })

  router.get('/err', async (req, res, _next) => {
    _next(new Error('An intential error occured for test purposes'))
  })

  return router
}

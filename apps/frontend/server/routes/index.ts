import { Router } from 'express'
import type { Services } from '../services'
import calculateRoutes from './calculate'

function routes({ exampleService, yjbApiClient, dtoService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const currentTime = exampleService.getCurrentTime()
    return res.render('pages/index', { currentTime })
  })

  router.use('/calculate', calculateRoutes({ dtoService }))

  router.get('/err', async (req, res, _next) => {
    _next(new Error('An intential error occured for test purposes'))
  })

  router.get('/api-test-proxy', async (req, res) => {
    const data = await yjbApiClient.getTestApiData()
    res.json(data)
  })

  return router
}

export default routes

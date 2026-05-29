import { Router } from 'express'
import type { Services } from '../services'
import YjbApiClient from '../data/yjbApi'

export default function routes({ exampleService }: Services): Router {
  const router = Router()
  
  router.get('/', async (req, res, _next) => {
    const currentTime = exampleService.getCurrentTime()
    return res.render('pages/index', { currentTime })  
  })

  router.get('/err', async (req, res, _next) => {
    _next(new Error('An intential error occured for test purposes'))
  })

  //this endpoint will be fetched during e2e test
  router.get('/api-test-proxy', async (req, res, next) => {
    const data = await new YjbApiClient().getTestApiData();
    res.json(data);
  })
  
  return router
}

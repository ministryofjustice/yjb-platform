import { Router } from 'express'
import type { Services } from '../services'
import { SentencePayload } from '../types/sentencePayload'
import { OutputCalculation } from '../types/dtoTypes'

export default function calculateRoutes({ yjbApiClient }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    return res.render('pages/new-calculation')
  })

  router.post('/', async (req, res, _next) => {
    const payload: SentencePayload = req.body

    const calculationResult: OutputCalculation = await yjbApiClient.realEndpointWithDummyData()

    return res.render('pages/calculation-breakdown', { calculationResult, payload })
  })

  return router
}

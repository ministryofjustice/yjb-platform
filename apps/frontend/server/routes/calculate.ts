import { Router } from 'express'
import type { Services } from '../services'
import { SentencePayload } from '../types/sentencePayload.tx'
import { CalculationResult } from '../types/calculationResult'

export default function calculateRoutes({ yjbApiClient }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    return res.render('pages/new-calculation')
  })

  router.post('/', async (req, res, _next) => {
    const payload: SentencePayload = req.body

    const calculationResult: CalculationResult = await yjbApiClient.calculateDtoSentence(payload)

    return res.render('pages/calculation-breakdown', { calculationResult })
  })

  return router
}

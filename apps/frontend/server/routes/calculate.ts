import { Router } from 'express'
import type { Services } from '../services'
import { InputSentences, OutputCalculation } from '../types/dtoTypes'

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    return res.render('pages/new-calculation')
  })

  router.post('/', async (req, res, _next) => {
    // TODO: translate input data formats into what's needed for an InputSentences DTO object
    const payload: InputSentences = req.body

    const validationResult = dtoService.validatePayload(payload)

    const calculationResult: OutputCalculation = await dtoService.calculateDtoSentence(validationResult)

    const payloadString = JSON.stringify(payload)
    const calculationResultString = JSON.stringify(calculationResult)

    return res.render('pages/calculation-breakdown', { calculationResult, payloadString, calculationResultString })
  })

  return router
}

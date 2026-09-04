import { Router } from 'express'
import type { Services } from '../services'
import { OutputCalculation } from '../types/dtoTypes'

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    return res.render('pages/new-calculation')
  })

  router.post('/', async (req, res, _next) => {
    const payload: Record<string, unknown> = req.body
    const payloadString = JSON.stringify(payload)

    const validationResult = dtoService.validatePayload(payload)

    if (validationResult.isValid) {
      const calculationResult: OutputCalculation = await dtoService.calculateDtoSentence(validationResult.payload)
      const calculationResultString = JSON.stringify(calculationResult)

      return res.render('pages/calculation-breakdown', { calculationResult, payloadString, calculationResultString })
    }
    // TODO: construct an error object and use it here
    return res.render('pages/new-calculation', { validationError: true } )
  })

  return router
}

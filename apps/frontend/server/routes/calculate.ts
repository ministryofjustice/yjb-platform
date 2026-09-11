import { Router } from 'express'
import type { Services } from '../services'
import { OutputCalculation } from '../types/dtoTypes'
import { ValidationResult } from '../services/dtoService'

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const {sentenceLengthMonths, remandDays, taggedBailDays, sentenceDate} = req.query
    const [sentenceDateDay, sentenceDateMonth, sentenceDateYear] = sentenceDate
      ? (sentenceDate as string).split('/')
      : []

    return res.render('pages/new-calculation', {
      sentenceLengthMonths,
      remandDays,
      taggedBailDays,
      sentenceDateDay,
      sentenceDateMonth,
      sentenceDateYear
    })
  })

  router.post('/', async (req, res, _next) => {
    const payload: Record<string, unknown> = req.body
    const payloadString = JSON.stringify(payload)

    const validationResult: ValidationResult = dtoService.validatePayload(payload)

    if (validationResult.isValid) {
      const calculationResult: OutputCalculation = await dtoService.calculateDtoSentence(validationResult.payload)
      const calculationResultString = JSON.stringify(calculationResult)

      return res.render('pages/calculation-breakdown', {
        calculationResult,
        inputData: validationResult.parsedInput,
        payloadString,
        calculationResultString,
      })
    }
    // TODO: construct an error object and use it here
    return res.render('pages/new-calculation', { validationError: true })
  })

  return router
}

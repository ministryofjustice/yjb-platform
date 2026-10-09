import { Router } from 'express'
import { OutputCalculation } from '@yjb-platform/shared-types'
import type { Services } from '../services'
import { ValidationResult } from '../services/dtoService'
import DtoFormPresenter, { FormPageObject } from '../presenters/dtoFormPresenter'
import CalculationResultPresentent, { CalculationResutlObj } from '../presenters/calculationResultPresentent'

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const { sentenceLengthMonths, remandDays, taggedBailDays, sentenceDate } = req.query
    const [sentenceDateDay, sentenceDateMonth, sentenceDateYear] = sentenceDate
      ? (sentenceDate as string).split('/')
      : []

    const formPageObject: FormPageObject = {
      // no payload has been submitted on first load, so there's nothing to
      // validate, isValid is true so the error summary doesn't render
      isValid: true,
      formData: {
        sentenceLengthMonths,
        remandDays,
        taggedBailDays,
        sentenceDateDay,
        sentenceDateMonth,
        sentenceDateYear,
      },
      errorSummary: [],
      errorsByField: {},
    }

    return res.render('pages/new-calculation', formPageObject)
  })

  router.post('/', async (req, res, _next) => {
    const payload: Record<string, unknown> = req.body
    const payloadString = JSON.stringify(payload)

    const validationResult: ValidationResult = dtoService.validatePayload(payload)

    if (validationResult.isValid) {
      const calculationResult: OutputCalculation = await dtoService.calculateDtoSentence(validationResult.payload)
      const formatedCalculation: CalculationResutlObj = new CalculationResultPresentent(calculationResult).prensent()

      return res.render('pages/calculation-breakdown', {
        calculationResult,
        inputData: validationResult.parsedInput,
        payloadString,
        ...formatedCalculation,
      })
    }

    return res.render('pages/new-calculation', new DtoFormPresenter(validationResult).present())
  })

  return router
}

import { Router } from 'express'
import {calcBreakdown, OutputCalculation} from '@yjb-platform/shared-types'
import type { Services } from '../services'
import {ParsedDtoForm, ValidationResult} from '../services/dtoService'
import DtoFormPresenter, { FormPageObject } from '../presenters/dtoFormPresenter'
import CalculationResultPresenter, { CalculationResultObj } from '../presenters/calculationResultPresenter'

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
      const formattedCalculation: CalculationResultObj = new CalculationResultPresenter(calculationResult).present()

      const pageData: CalculationResultPageObject = {
        calculationResult,
        inputData: validationResult.parsedInput,
        payloadString,
        ...formattedCalculation,
      }

      return res.render('pages/calculation-breakdown', pageData)
    }

    const pageData: FormPageObject = new DtoFormPresenter(validationResult).present()

    return res.render('pages/new-calculation', pageData)
  })

  return router
}

type CalculationResultPageObject = CalculationResultObj & {
  calculationResult: OutputCalculation,
  inputData: ParsedDtoForm,
  payloadString: string
}

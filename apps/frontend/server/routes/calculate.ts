import { Router } from 'express'
import { UTCDate } from '@date-fns/utc'
import { isValid, parse } from 'date-fns'
import { OutputCalculation } from '@yjb-platform/shared-types'
import type { Services } from '../services'
import { ParsedDtoForm, ValidationResult } from '../services/dtoService'
import DtoFormPresenter, { FormPageObject } from '../presenters/dtoFormPresenter'
import CalculationResultPresenter, { CalculationResultObj } from '../presenters/calculationResultPresenter'
import { toDateString } from '../utils/dateUtils'

type DateParts = {
  day?: number
  month?: number
  year?: number
}

// The back link sends dates in the query string as yyyy-mm-dd (in function toDateString),
// but the form shows each date as three separate boxes
function getDatePartsFromQuery(queryValue: unknown): DateParts {
  if (typeof queryValue !== 'string') {
    return {}
  }

  const date = parse(queryValue, 'yyyy-MM-dd', new UTCDate())
  if (!isValid(date)) {
    return {}
  }

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

export type CalculationBreakdownInputData = ParsedDtoForm & {
  sentenceDateBtnStr: string
  remandStartDateBtnStr: string
}

function toBackLinkDate(date: Date | undefined): string {
  if (date === undefined) {
    return ''
  }

  return toDateString(date)
}

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const { sentenceLengthMonths, taggedBailDays } = req.query
    const sentenceDate = getDatePartsFromQuery(req.query.sentenceDate)
    const remandStartDate = getDatePartsFromQuery(req.query.remandStartDate)

    const formPageObject: FormPageObject = {
      // no payload has been submitted on first load, so there's nothing to
      // validate, isValid is true so the error summary doesn't render
      isValid: true,
      formData: {
        sentenceLengthMonths,
        taggedBailDays,
        sentenceDateDay: sentenceDate.day,
        sentenceDateMonth: sentenceDate.month,
        sentenceDateYear: sentenceDate.year,
        remandStartDateDay: remandStartDate.day,
        remandStartDateMonth: remandStartDate.month,
        remandStartDateYear: remandStartDate.year,
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
      const formattedCalculation: CalculationResultObj = new CalculationResultPresenter().present(calculationResult)

      const { parsedInput } = validationResult
      const inputData: CalculationBreakdownInputData = {
        ...parsedInput,
        sentenceDateBtnStr: toBackLinkDate(parsedInput.sentenceDate),
        remandStartDateBtnStr: toBackLinkDate(parsedInput.remandStartDate),
      }

      const pageData: CalculationResultPageObject = {
        calculationResult,
        inputData,
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
  calculationResult: OutputCalculation
  inputData: CalculationBreakdownInputData
  payloadString: string
}

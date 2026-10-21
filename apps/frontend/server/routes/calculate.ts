import { Router } from 'express'
import { UTCDate } from '@date-fns/utc'
import { isValid, parse } from 'date-fns'
import { OutputCalculation, toDateString } from '@yjb-platform/shared-types'
import type { Services } from '../services'
import { ParsedDtoForm, ValidationResult } from '../services/dtoService'
import DtoFormPresenter, { FormPageObject } from '../presenters/dtoFormPresenter'
import CalculationResultPresenter, { CalculationResultObj } from '../presenters/calculationResultPresenter'

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
  erdEligibility: string
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
    const { sentenceLengthMonths, taggedBailDays, erdEligible } = req.query
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
        // the back link sends the ERD answer as "true" or "false" - anything else leaves both radios unselected
        erdEligible: erdEligible === 'true' || erdEligible === 'false' ? erdEligible === 'true' : undefined,
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
      const { parsedInput } = validationResult
      const formattedCalculation: CalculationResultObj = new CalculationResultPresenter().present(calculationResult)
      const inputData: CalculationBreakdownInputData = {
        ...parsedInput,
        sentenceDateBtnStr: toBackLinkDate(parsedInput.sentenceDate),
        remandStartDateBtnStr: toBackLinkDate(parsedInput.remandStartDate),
        erdEligibility: parsedInput.erdEligible ? 'Eligible' : 'Not Eligible',
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

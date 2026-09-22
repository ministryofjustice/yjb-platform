import { Router } from 'express'
import { OutputCalculation, calcBreakdown, AdjustmentTypes } from '@yjb-platform/shared-types'
import type { Services } from '../services'
import { ValidationResult } from '../services/dtoService'

function formatUkDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(date),
  )
}

export default function calculateRoutes({ dtoService }: Partial<Services>): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const { sentenceLengthMonths, remandDays, taggedBailDays, sentenceDate } = req.query
    const [sentenceDateDay, sentenceDateMonth, sentenceDateYear] = sentenceDate
      ? (sentenceDate as string).split('/')
      : []

    return res.render('pages/new-calculation', {
      sentenceLengthMonths,
      remandDays,
      taggedBailDays,
      sentenceDateDay,
      sentenceDateMonth,
      sentenceDateYear,
    })
  })

  router.post('/', async (req, res, _next) => {
    const payload: Record<string, unknown> = req.body
    const payloadString = JSON.stringify(payload)

    const validationResult: ValidationResult = dtoService.validatePayload(payload)

    if (validationResult.isValid) {
      const calculationResult: OutputCalculation = await dtoService.calculateDtoSentence(validationResult.payload)
      const calculationResultString = JSON.stringify(calculationResult)

      // TODO: move breakdown string construction in a dedicated method
      const remandAdjustmentRecord = calculationResult.effectiveDatesPastAdjustments[0]
      const remandBreakdown =
        remandAdjustmentRecord?.adjustmentParameters.name === AdjustmentTypes.remand
          ? `(${formatUkDate(remandAdjustmentRecord.adjustmentParameters.startDate)} to ${formatUkDate(
              new Date(
                new Date(calculationResult.calculatedTerms[0].inputSentence.from).getTime() - 24 * 60 * 60 * 1000,
              ),
            )})`
          : ''

      const breakdownObj: calcBreakdown = {
        custodialPeriodBreakdown: `${calculationResult.calculatedTerms[0].totalDaysInTerm} / 2${
          calculationResult.calculatedTerms[0].totalDaysInTerm % 2 ? ', rounded up' : ''
        }`,
        mtdBreadown: `${calculationResult.calculatedTerms[0].totalDaysMTD} days from the beginning of the sentence (${formatUkDate(
          calculationResult.calculatedTerms[0].inputSentence.from,
        )})`,
        remandPeriodBreakdown: remandBreakdown,
      }

      return res.render('pages/calculation-breakdown', {
        calculationResult,
        inputData: validationResult.parsedInput,
        payloadString,
        breakdownObj,
        calculationResultString,
      })
    }
    // TODO: construct an error object and use it here
    return res.render('pages/new-calculation', { validationError: true })
  })

  return router
}

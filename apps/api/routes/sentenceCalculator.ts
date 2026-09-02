import { Router, Request, Response } from 'express'
import { InputSentences } from '../services/sentenceCalculator/types'
import sentenceCalculatorController from '../controllers/sentenceCalculatorController'

export function calculateSentence(req: Request, res: Response): void {

  const sentence = req.body as InputSentences
  const calculatedCalculationObj = sentenceCalculatorController(sentence)

  res.status(200).type('application/json').send(JSON.stringify(calculatedCalculationObj, dateOnlyReplacer))
}

function dateOnlyReplacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const raw = this[key]
  return raw instanceof Date ? raw.toISOString().slice(0, 10) : value
}

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  router.post('/', calculateSentence)
  return router
}

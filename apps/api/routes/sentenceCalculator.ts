import { Router, Request, Response } from 'express'
import SentenceCalculator from '../services/sentenceCalculator/SentenceCalculator'
import { Sentence } from '../services/sentenceCalculator/types'

export function calculateSentence(req: Request, res: Response): void {
  const sentence = req.body as Sentence

  // construct a sentence object from deserialized input onbect
  // TODO: extract this in parser class which also does simple validation
  sentence.term = sentence.term.map(term => ({ ...term, from: new Date(term.from) }))

  // TODO: introduce a controller which determines if adjustmnets should be
  // made based on remand / tag bail or not
  const calculator = new SentenceCalculator(sentence)

  res.status(200).json(calculator.getCalculation())
}

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  router.post('/', calculateSentence)
  return router
}

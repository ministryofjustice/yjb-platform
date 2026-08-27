import { Router, Request, Response } from 'express'
import SentenceCalculator from '../services/sentenceCalculator/SentenceCalculator'
import { Sentence, Term, Reason } from '../services/sentenceCalculator/types'


export function calculateSentence(req: Request, res: Response): void {
  res.status(200).json()
}

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  router.post('/calculations', calculateSentence)
  return router
}
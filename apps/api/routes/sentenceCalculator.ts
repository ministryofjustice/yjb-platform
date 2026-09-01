import { Router, Request, Response } from 'express'
import { Sentence } from '../services/sentenceCalculator/types'
import { SentenceCalculatorController } from '../controllers/sentenceCalculatorController'

export function calculateSentence(req: Request, res: Response): void {
    const sentence = req.body as Sentence

    // construct a sentence object from deserialized input onbect
    // TODO: extract this in parser class which also does simple validation
    sentence.term = sentence.term.map(term => ({ ...term, from: new Date(term.from) }))
    const calculatedCalulationObj = new SentenceCalculatorController(sentence);


    res.status(200).json(calculatedCalulationObj)
}

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  router.post('/', calculateSentence)
  return router
}

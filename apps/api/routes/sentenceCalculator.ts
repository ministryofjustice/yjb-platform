import { Router, Request, Response } from 'express'
import { InputSentences } from '../services/sentenceCalculator/types'
import { SentenceCalculatorController } from '../controllers/sentenceCalculatorController'

export function calculateSentence(req: Request, res: Response): void { //move this to controller
    const sentence = req.body as InputSentences

    sentence.inputIndividualSentences = sentence.inputIndividualSentences.map(term => ({ ...term, from: new Date(term.from) }))
    if (sentence.remandAdjustment) {
        sentence.remandAdjustment = { ...sentence.remandAdjustment, startDate: new Date(sentence.remandAdjustment.startDate) }
    }
    const calculatedCalulationObj = new SentenceCalculatorController(sentence);

    res.status(200).type('application/json').send(JSON.stringify(calculatedCalulationObj, dateOnlyReplacer))
}

function dateOnlyReplacer(this: any, key: string, value: unknown): unknown {
    return this[key] instanceof Date ? this[key].toISOString().slice(0, 10) : value
}

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  router.post('/', calculateSentence)
  return router
}

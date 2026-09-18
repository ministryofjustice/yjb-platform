import { Router, Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import SentenceCalculatorController from '../controllers/sentenceCalculatorController'
import { parseInputSentences, formatOutputCalculation } from '../controllers/sentenceCalculatorMapper'

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  const controller = new SentenceCalculatorController()
  router.post('/', (req: Request, res: Response, next: NextFunction) => {
    try {
      const deserializedInput = parseInputSentences(req.body)
      const calculatedCalculationObj = controller.getCalculation(deserializedInput)
      res.status(200).type('application/json').send(formatOutputCalculation(calculatedCalculationObj))
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .type('application/json')
          .send(JSON.stringify({ errors: error.issues }))
        return
      }
      next(error)
    }
  })
  return router
}

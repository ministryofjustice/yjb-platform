import { Router, Request, Response } from 'express'
import SentenceCalculatorController from '../controllers/sentenceCalculatorController'

export default function sentenceCalculatorRoutes(): Router {
  const router = Router()
  const controller = new SentenceCalculatorController()
  router.post('/', (req: Request, res: Response) => {
    const calculatedCalculationObj = controller.getCalculation(controller.parseInput(req.body))
    res.status(200).type('application/json').send(controller.formatOutputCalculation(calculatedCalculationObj))
  })
  return router
}

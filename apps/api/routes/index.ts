import { Router, Request, Response } from 'express'
import sentenceCalculatorRoutes from './sentenceCalculator'

export default function routes(): Router {
  const router = Router()
  router.get('/', (req: Request, res: Response) => {
    res.send('This is the main router')
  })

  router.get('/test-api', (req: Request, res: Response) => {
    res.json({ name: 'test-name' })
  })

  router.use('/calculations', sentenceCalculatorRoutes())

  return router
}

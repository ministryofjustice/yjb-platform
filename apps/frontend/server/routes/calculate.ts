import { Router } from 'express'
// import type { Services } from '../services'

export default function calculateRoutes(): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    return res.render('pages/new-calculation')
  })

  router.post('/', async (req, res, _next) => {
    return res.render('pages/calculation-breakdown')
  })

  return router
}

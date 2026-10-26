import express, { Router } from 'express'

export default function setUpWebRequestParsing(): Router {
  const router = express.Router()
  router.use(express.json({ inflate: false }))
  router.use(express.urlencoded({ extended: true }))
  return router
}

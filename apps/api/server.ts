import express, { Request, Response } from 'express'

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.send('This is the root api response')
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})

const express = require('express')

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

app.get('/', (_req, res) => {
  res.send("This is the root api response")
})

app.get('/health', (_req, res) => {
  res.json({ status: 'happy' })
})

app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})

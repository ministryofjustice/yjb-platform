import request from 'supertest'
import express from 'express'
import routes from './index'

const app = express()
app.use(routes())

describe('GET /', () => {
  it('should return 200', () => {
    return request(app).get('/').expect(200)
  })
})

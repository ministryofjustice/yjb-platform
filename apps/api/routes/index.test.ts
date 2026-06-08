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

describe('GET /test-api', () => {
  it('should return req headers in a json', () => {
    return request(app).get('/test-api').expect(200, { name: 'test-name' })
  })
})

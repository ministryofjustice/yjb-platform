import request from 'supertest'
import express from 'express'
import sentenceCalculatorRoutes from './sentenceCalculator'

const app = express()
app.use(sentenceCalculatorRoutes())

describe('GET /calculations just returns 200', () => {
    it('should return 200', () => {
        return request(app).post('/calculations').expect(200)
    })
})

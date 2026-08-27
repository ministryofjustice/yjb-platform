import request from 'supertest'
import express from 'express'
import sentenceCalculatorRoutes from './sentenceCalculator'

const app = express()
app.use(express.json())
app.use(sentenceCalculatorRoutes())

describe('POST /calculations', () => {
  it('should return valid calculations for a valid input of sentence with no remand', () => {
    const input = {
      term: [
        {
          from: '2026-06-29',
          durationMonths: 11,
          offenderName: 'Test Offender',
          remand: 0,
        },
      ],
    }

    const output = {
      totalDaysInTerm: 334,
      sledDate: '2027-05-28T00:00:00.000Z',
      totalDaysMTD: 167,
      mtdDate: '2026-12-12T00:00:00.000Z',
      adjustmentRecords: [],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })
})

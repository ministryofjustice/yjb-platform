import request from 'supertest'
import express from 'express'
import sentenceCalculatorRoutes from './sentenceCalculator'

const app = express()
app.use(express.json())
app.use('/calculations', sentenceCalculatorRoutes())

describe('POST /calculations', () => {
  it('should return valid calculations for a valid input of sentence with no remand', () => {
    const input = {
      offenderName: 'Test Offender',
      remand: 0,
      remandStartDate: new Date(),
      taggedBailDays: 0,
      inputIndividualSentences: [
        {
          from: '2026-06-29',
          durationMonths: 11,
        },
      ],
    }

    const output = {
        totalDaysInTerm: 334,
        totalDaysMTD: 167,
        effectiveDates: {
            sled: '2027-05-28T00:00:00.000Z',
            mtd: '2026-12-12T00:00:00.000Z',
            ltd: '2027-01-12T00:00:00.000Z',
            etd: '2026-11-12T00:00:00.000Z',
        },
      pastCalculations: [],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('should return a valid calculation for a valid input with 15 days remand', () => {
        const input = {
            offenderName: 'Test Offender',
            remand: 15,
            remandStartDate: new Date('2026-06-14'),
            taggedBailDays: 0,
            inputIndividualSentences: [
            {
                from: '2026-06-29',
                durationMonths: 11,
                },
            ],
        }
        const output = {
            totalDaysInTerm: 334,
            totalDaysMTD: 167,
            effectiveDates: {
                sled: '2027-05-13T00:00:00.000Z',
                mtd: '2026-11-27T00:00:00.000Z',
                ltd: '2026-12-27T00:00:00.000Z',
                etd: '2026-10-27T00:00:00.000Z',
            },
        pastCalculations: [{ adjustmentReason: 'remand', oldSled:  '2027-05-28T00:00:00.000Z', oldMtd: '2026-12-12T00:00:00.000Z' }],
        }

        return request(app).post('/calculations').send(input).expect(200, output)
  })
})

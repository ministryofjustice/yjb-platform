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
      inputAdjustments: {
        remand: 0,
        remandStartDate: new Date(),
        taggedBailDays: 0,
      },
      inputIndividualSentences: [
        {
          from: '2026-06-29',
          durationMonths: 11,
        },
      ],
    }

    const output = {
        caluclatedTerms: [
            {
                inputSentece: { from: '2026-06-29', durationMonths: 11 },
                totalDaysInTerm: 334,
                totalDaysMTD: 167,
                sled: '2027-05-28',
                mtd: '2026-12-12',
            },
        ],
        effectiveDates: {
            sled: '2027-05-28',
            mtd: '2026-12-12',
            ltd: '2027-01-12',
            etd: '2026-11-12',
        },
      pastCalculations: [],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('should return a valid calculation for a valid input with 15 days remand', () => {
        const input = {
            offenderName: 'Test Offender',
            inputAdjustments: {
                remand: 15,
                remandStartDate: new Date('2026-06-14'),
                taggedBailDays: 0,
            },
            inputIndividualSentences: [
            {
                from: '2026-06-29',
                durationMonths: 11,
                },
            ],
        }
        const output = {
            caluclatedTerms: [
                {
                    inputSentece: { from: '2026-06-29', durationMonths: 11 },
                    totalDaysInTerm: 334,
                    totalDaysMTD: 167,
                    sled: '2027-05-28',
                    mtd: '2026-12-12',
                },
            ],
            effectiveDates: {
                sled: '2027-05-13',
                mtd: '2026-11-27',
                ltd: '2026-12-27',
                etd: '2026-10-27',
            },
        pastCalculations: [{ adjustmentReason: 'remand', oldSled:  '2027-05-28', oldMtd: '2026-12-12' }],
        }

        return request(app).post('/calculations').send(input).expect(200, output)
  })
})

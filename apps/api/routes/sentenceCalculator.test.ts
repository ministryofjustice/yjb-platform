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
      inputIndividualSentences: [
        {
          from: '2026-06-29',
          durationMonths: 11,
        },
      ],
    }

    const output = {
        calculatedTerms: [
            {
                inputSentence: { from: '2026-06-29', durationMonths: 11 },
                totalDaysInTerm: 334,
                totalDaysMTD: 167,
                sled: '2027-05-28',
                mtd: '2026-12-12',
            },
        ],
        effectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: '2027-05-28',
            mtd: '2026-12-12',
            TUSED: '1970-01-01',
        },
      ltd: '2027-01-12',
      etd: '2026-11-12',
      effectiveDatesPastAdjustments: [],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('should return a valid calculation for a valid input with 15 days remand', () => {
        const input = {
            offenderName: 'Test Offender',
            remandAdjustment: {
                name: 'remand',
                days: 15,
                startDate: new Date('2026-06-14'),
            },
            inputIndividualSentences: [
            {
                from: '2026-06-29',
                durationMonths: 11,
                },
            ],
        }
        const output = {
            calculatedTerms: [
                {
                    inputSentence: { from: '2026-06-29', durationMonths: 11 },
                    totalDaysInTerm: 334,
                    totalDaysMTD: 167,
                    sled: '2027-05-28',
                    mtd: '2026-12-12',
                },
            ],
            effectiveDates: {
                totalNumberOfRemandAndTaggedBailDays: 0,
                sled: '2027-05-13',
                mtd: '2026-11-27',
                TUSED: '1970-01-01',
            },
            ltd: '2026-12-27',
            etd: '2026-10-27',
        effectiveDatesPastAdjustments: [{
            adjustmentReason: 'remand',
            adjustmentParameters: {
                name: 'remand',
                days: 15,
                startDate: '2026-06-14',
            },
            pastEffectiveDates: {
                totalNumberOfRemandAndTaggedBailDays: 0,
                sled: '2027-05-28',
                mtd: '2026-12-12',
                TUSED: '1970-01-01',
            },
        }],
        }

        return request(app).post('/calculations').send(input).expect(200, output)
  })
})

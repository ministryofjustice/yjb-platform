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
      ltd: {
        data: '2027-01-12',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      etd: {
        data: '2026-11-12',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      effectiveDatesPastAdjustments: [],
      unusedAdjustmentDays: 0,
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
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: '2027-05-13',
        mtd: '2026-11-27',
        TUSED: '1970-01-01',
      },
      ltd: {
        data: '2026-12-27',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      etd: {
        data: '2026-10-27',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      unusedAdjustmentDays: 0,
      effectiveDatesPastAdjustments: [
        {
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
        },
      ],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('returns 2026-06-19 remand start date for sentence starting on 2026-06-29 with 10 days of remand, which has no initial start date', () => {
    const inputSentence = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: 'remand',
        days: 10,
      },
      taggedBailAdjustment: {
        name: 'taggedBail',
        days: 5,
      },
      inputIndividualSentences: [
        {
          from: '2026-06-29',
          durationMonths: 11,
        },
      ],
    }

    const expectedOutputCalculation = {
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
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: '2027-05-13',
        mtd: '2026-11-27',
        TUSED: '1970-01-01',
      },
      ltd: {
        data: '2026-12-27',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      etd: {
        data: '2026-10-27',
        metadata: {
          status: '1_month',
          message: '1 month away from the MTD for DTOs of 8 months, but less then 18 months',
        },
      },
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: {
            name: 'remand',
            days: 10,
            startDate: '2026-06-19',
          },
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: '2027-05-28',
            mtd: '2026-12-12',
            TUSED: '1970-01-01',
          },
        },
        {
          adjustmentReason: 'taggedBail',
          adjustmentParameters: {
            name: 'taggedBail',
            days: 5,
          },
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 10,
            sled: '2027-05-18',
            mtd: '2026-12-02',
            TUSED: '1970-01-01',
          },
        },
      ],
      unusedAdjustmentDays: 0,
    }

    return request(app).post('/calculations').send(inputSentence).expect(200, expectedOutputCalculation)
  })

  it('should return 400 with validation errors for an invalid input', async () => {
    const input = {
      inputIndividualSentences: [],
    }

    const response = await request(app).post('/calculations').send(input).expect(400)

    expect(response.body.errors).toBeInstanceOf(Array)
    expect(response.body.errors.length).toBeGreaterThan(0)
  })
})

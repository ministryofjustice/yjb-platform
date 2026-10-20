import request from 'supertest'
import express from 'express'
import { DtoEligibilityStatus, AppliedAdjustmentStatus } from '@yjb-platform/shared-types'
import {
  DTO_ELIGIBILITY_MESSAGES,
  FINAL_SLED_BREAKDOWN_MESSAGE,
} from '../services/sentenceCalculator/helpers/dateObjects'
import sentenceCalculatorRoutes from './sentenceCalculator'
import { sampleInputSentencesBody } from '../testutils/sampleObjects'

const app = express()
app.use(express.json())
app.use('/calculations', sentenceCalculatorRoutes())

describe('POST /calculations', () => {
  it('should return valid calculations for a valid input of sentence with no remand', () => {
    const input = sampleInputSentencesBody

    const output = {
      calculatedTerms: [
        {
          inputSentence: { from: '2026-06-29', durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: {
            data: '2027-05-28',
            metadata: {
              dayOfWeek: 'Friday',
              message: '334 days from the beginning of the sentence (29 June 2026)',
            },
          },
          mtd: {
            data: '2026-12-12',
            metadata: {
              dayOfWeek: 'Saturday',
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 0,
        sled: {
          data: '2027-05-28',
          metadata: {
            status: AppliedAdjustmentStatus.not_applied,
            message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
            dayOfWeek: 'Friday',
          },
        },
        mtd: {
          data: '2026-12-12',
          metadata: {
            status: AppliedAdjustmentStatus.not_applied,
            message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
            dayOfWeek: 'Saturday',
          },
        },
        TUSED: '1970-01-01',
      },
      ltd: {
        data: '2027-01-12',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Tuesday',
        },
      },
      etd: {
        data: '2026-11-12',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Thursday',
        },
      },
      erd: {
        data: '2026-11-12',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Thursday',
        },
      },
      effectiveDatesPastAdjustments: [],
      unusedAdjustmentDays: 0,
      remandPeriodDays: 0,
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('should return a valid calculation for a valid input with 15 days remand', () => {
    const input = {
      ...sampleInputSentencesBody,
      remandAdjustment: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
      },
    }
    const output = {
      calculatedTerms: [
        {
          inputSentence: { from: '2026-06-29', durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: {
            data: '2027-05-28',
            metadata: {
              dayOfWeek: 'Friday',
              message: '334 days from the beginning of the sentence (29 June 2026)',
            },
          },
          mtd: {
            data: '2026-12-12',
            metadata: {
              dayOfWeek: 'Saturday',
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: {
          data: '2027-05-13',
          metadata: {
            status: AppliedAdjustmentStatus.applied,
            message: '28 May 2027 minus 15 days',
            dayOfWeek: 'Thursday',
          },
        },
        mtd: {
          data: '2026-11-27',
          metadata: {
            status: AppliedAdjustmentStatus.applied,
            message: '12 December 2026 minus 15 days',
            dayOfWeek: 'Friday',
          },
        },
        TUSED: '1970-01-01',
      },
      ltd: {
        data: '2026-12-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Sunday',
        },
      },
      etd: {
        data: '2026-10-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Tuesday',
        },
      },
      erd: {
        data: '2026-10-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Tuesday',
        },
      },
      unusedAdjustmentDays: 0,
      remandPeriodDays: 15,
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: {
            name: 'remand',
            startDate: '2026-06-14',
          },
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: {
              data: '2027-05-28',
              metadata: {
                status: AppliedAdjustmentStatus.not_applied,
                message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
                dayOfWeek: 'Friday',
              },
            },
            mtd: {
              data: '2026-12-12',
              metadata: {
                status: AppliedAdjustmentStatus.not_applied,
                message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
                dayOfWeek: 'Saturday',
              },
            },
            TUSED: '1970-01-01',
          },
        },
      ],
    }

    return request(app).post('/calculations').send(input).expect(200, output)
  })

  it('returns 10 days of remand for a remand start date of 2026-06-19 and a sentence starting on 2026-06-29', () => {
    const inputSentence = {
      ...sampleInputSentencesBody,
      remandAdjustment: {
        name: 'remand',
        startDate: '2026-06-19',
      },
      taggedBailAdjustment: {
        name: 'taggedBail',
        days: 5,
      },
    }

    const expectedOutputCalculation = {
      calculatedTerms: [
        {
          inputSentence: { from: '2026-06-29', durationMonths: 11 },
          totalDaysInTerm: 334,
          totalDaysMTD: 167,
          sled: {
            data: '2027-05-28',
            metadata: {
              dayOfWeek: 'Friday',
              message: '334 days from the beginning of the sentence (29 June 2026)',
            },
          },
          mtd: {
            data: '2026-12-12',
            metadata: {
              dayOfWeek: 'Saturday',
              message: '167 days from the beginning of the sentence (29 June 2026)',
            },
          },
        },
      ],
      effectiveDates: {
        totalNumberOfRemandAndTaggedBailDays: 15,
        sled: {
          data: '2027-05-13',
          metadata: {
            status: AppliedAdjustmentStatus.applied,
            message: '28 May 2027 minus 15 days',
            dayOfWeek: 'Thursday',
          },
        },
        mtd: {
          data: '2026-11-27',
          metadata: {
            status: AppliedAdjustmentStatus.applied,
            message: '12 December 2026 minus 15 days',
            dayOfWeek: 'Friday',
          },
        },
        TUSED: '1970-01-01',
      },
      ltd: {
        data: '2026-12-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Sunday',
        },
      },
      etd: {
        data: '2026-10-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Tuesday',
        },
      },
      erd: {
        data: '2026-10-27',
        metadata: {
          status: DtoEligibilityStatus.oneMonth,
          message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.oneMonth],
          dayOfWeek: 'Tuesday',
        },
      },
      effectiveDatesPastAdjustments: [
        {
          adjustmentReason: 'remand',
          adjustmentParameters: {
            name: 'remand',
            startDate: '2026-06-19',
          },
          pastEffectiveDates: {
            totalNumberOfRemandAndTaggedBailDays: 0,
            sled: {
              data: '2027-05-28',
              metadata: {
                status: AppliedAdjustmentStatus.not_applied,
                message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
                dayOfWeek: 'Friday',
              },
            },
            mtd: {
              data: '2026-12-12',
              metadata: {
                status: AppliedAdjustmentStatus.not_applied,
                message: FINAL_SLED_BREAKDOWN_MESSAGE[AppliedAdjustmentStatus.not_applied],
                dayOfWeek: 'Saturday',
              },
            },
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
            sled: {
              data: '2027-05-18',
              metadata: {
                status: AppliedAdjustmentStatus.applied,
                message: '28 May 2027 minus 10 days',
                dayOfWeek: 'Tuesday',
              },
            },
            mtd: {
              data: '2026-12-02',
              metadata: {
                status: AppliedAdjustmentStatus.applied,
                message: '12 December 2026 minus 10 days',
                dayOfWeek: 'Wednesday',
              },
            },
            TUSED: '1970-01-01',
          },
        },
      ],
      unusedAdjustmentDays: 0,
      remandPeriodDays: 10,
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

  it('should return 400 with an erdEligible validation error when erdEligible is missing', async () => {
    const { erdEligible: _omitted, ...input } = sampleInputSentencesBody

    const response = await request(app).post('/calculations').send(input).expect(400)

    expect(response.body.errors).toContainEqual(expect.objectContaining({ path: ['erdEligible'] }))
  })

  it('should return an ERD of 0 and not eligible, with the ETD unchanged, when erdEligible is false', async () => {
    const input = { ...sampleInputSentencesBody, erdEligible: false }

    const response = await request(app).post('/calculations').send(input).expect(200)

    expect(response.body.erd).toEqual({
      data: 0,
      metadata: {
        status: DtoEligibilityStatus.notEligible,
        message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.notEligible],
      },
    })
    expect(response.body.etd.data).toBe('2026-11-12')
  })
})

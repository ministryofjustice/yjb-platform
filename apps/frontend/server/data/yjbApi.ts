import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'
import { InputSentences, OutputCalculation } from '../types/dtoTypes'

export default class YjbApiClient extends RestClient {
  constructor() {
    super('yjb-api', config.apis.yjbApi, logger, { getToken: async () => '' })
  }

  async getTestApiData() {
    return this.get({ path: '/test-api' })
  }

  async calculateDtoSentence(payload: InputSentences): Promise<OutputCalculation> {
    const dummyPayload: InputSentences = {
      offenderName: 'Test Offender',
      remandAdjustment: {
        name: 'remand',
        startDate: new Date('2026-06-14'),
        days: payload.remandAdjustment.days,
      },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }

    const result: Promise<OutputCalculation> = this.post({ path: '/calculations', data: dummyPayload })

    return result
  }

  async realEndpointWithDummyData(): Promise<OutputCalculation> {
    const dummyData: InputSentences = {
      offenderName: 'Test Offender',
      // inputAdjustments: {
      //   remand: 15,
      //   remandStartDate: new Date('2026-06-14'),
      //   taggedBailDays: 0,
      // },
      inputIndividualSentences: [
        {
          from: new Date('2026-06-29'),
          durationMonths: 11,
        },
      ],
    }

    // curl -X POST localhost:3001/calculations \
    // -H "Content-Type: application/json" \
    // -d '{"offenderName":"Test Offender","inputIndividualSentences":[{"from":"2026-06-29","durationMonths":11}]}'

    const result: Promise<OutputCalculation> = this.post({ path: '/calculations', data: dummyData })

    return result
  }
}

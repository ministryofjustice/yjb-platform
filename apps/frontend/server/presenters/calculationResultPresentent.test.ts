import { DTO_ELIGIBILITY_MESSAGES, DtoEligibilityStatus, OutputCalculation } from '@yjb-platform/shared-types'
import CalculationResultPresentent from './calculationResultPresentent'
import { sampleCalculationResult } from '../testutils/sampleObjects'

describe('calculationResultPresentent', () => {
  const { breakdownObj } = new CalculationResultPresentent(sampleCalculationResult).prensent()

  it('formats the SLED and final MTD breakdowns from their metadata', () => {
    expect(breakdownObj.sledBreakdown).toBe('Thursday, 13 May 2027, 2027-05-28 minus 15 days')
    expect(breakdownObj.finalMtdBreakdown).toBe('Friday, 27 November 2026, 2026-12-12 minus 15 days')
  })

  it('formats the ETD and LTD breakdowns from their metadata', () => {
    expect(breakdownObj.etdBreakdown).toBe(
      'Tuesday, 27 October 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months',
    )
    expect(breakdownObj.ltdBreakdown).toBe(
      'Sunday, 27 December 2026, 1 month away from the MTD for DTOs with terms from 8 to 18 months',
    )
  })

  it('shows only the message for a transfer date that was not calculated', () => {
    const notCalculated = {
      data: 0 as const,
      metadata: {
        status: DtoEligibilityStatus.notCalculated,
        message: DTO_ELIGIBILITY_MESSAGES[DtoEligibilityStatus.notCalculated],
      },
    }
    const result: OutputCalculation = { ...sampleCalculationResult, etd: notCalculated, ltd: notCalculated }

    const { breakdownObj: notCalculatedBreakdown } = new CalculationResultPresentent(result).prensent()

    expect(notCalculatedBreakdown.etdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedBreakdown.ltdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')
  })

  it('formats dates that arrive as JSON-serialized strings (real API shape)', () => {
    const fromApi = JSON.parse(JSON.stringify(sampleCalculationResult)) as OutputCalculation

    const { breakdownObj: apiBreakdown } = new CalculationResultPresentent(fromApi).prensent()

    expect(apiBreakdown).toEqual(breakdownObj)
  })
})

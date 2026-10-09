import { DtoEligibilityStatus, OutputCalculation } from '@yjb-platform/shared-types'
import CalculationResultPresentent from './calculationResultPresentent'
import { sampleCalculationResult } from '../testutils/sampleObjects'

describe('calculationResultPresentent', () => {
  const { breakdownObj, termDates, resultDates } = new CalculationResultPresentent(sampleCalculationResult).prensent()

  it('formats the term SLED and MTD from their metadata', () => {
    expect(termDates.sled).toBe('Friday 2027-05-28')
    expect(termDates.mtd).toBe('Saturday 2026-12-12')
  })

  it('formats the result dates as day of the week and date', () => {
    expect(resultDates).toEqual({
      sled: 'Thursday 2027-05-13',
      finalMtd: 'Friday 2026-11-27',
      etd: 'Tuesday 2026-10-27',
      ltd: 'Sunday 2026-12-27',
    })
  })

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
        message: 'Not applicable for DTOs with terms less than 8 months',
      },
    }
    const result: OutputCalculation = { ...sampleCalculationResult, etd: notCalculated, ltd: notCalculated }

    const { breakdownObj: notCalculatedBreakdown } = new CalculationResultPresentent(result).prensent()

    expect(notCalculatedBreakdown.etdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedBreakdown.ltdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')

    const { resultDates: notCalculatedDates } = new CalculationResultPresentent(result).prensent()
    expect(notCalculatedDates.etd).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedDates.ltd).toBe('Not applicable for DTOs with terms less than 8 months')
  })

  it('formats dates that arrive as JSON-serialized strings (real API shape)', () => {
    const fromApi = JSON.parse(JSON.stringify(sampleCalculationResult)) as OutputCalculation

    const {
      breakdownObj: apiBreakdown,
      termDates: apiTermDates,
      resultDates: apiResultDates,
    } = new CalculationResultPresentent(fromApi).prensent()

    expect(apiBreakdown).toEqual(breakdownObj)
    expect(apiTermDates).toEqual(termDates)
    expect(apiResultDates).toEqual(resultDates)
  })
})

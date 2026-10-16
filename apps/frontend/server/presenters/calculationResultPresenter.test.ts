import { DtoEligibilityStatus, OutputCalculation } from '@yjb-platform/shared-types'
import CalculationResultPresenter from './calculationResultPresenter'
import { sampleCalculationResult } from '../testutils/sampleObjects'

describe('calculationResultPresenter', () => {
  const { breakdownObj, termDates, resultDates } = new CalculationResultPresenter().present(sampleCalculationResult)

  it('formats the term SLED and MTD from their metadata', () => {
    expect(termDates.sled).toBe('Friday, 28 May 2027')
    expect(termDates.mtd).toBe('Saturday, 12 December 2026')
  })

  it('formats the result dates as day of the week and date', () => {
    expect(resultDates).toEqual({
      finalSled: 'Thursday, 13 May 2027',
      finalMtd: 'Friday, 27 November 2026',
      etd: 'Tuesday, 27 October 2026',
      ltd: 'Sunday, 27 December 2026',
    })
  })

  it('formats the SLED and final MTD breakdowns from their metadata', () => {
    expect(breakdownObj.finalSledBreakdown).toBe('Thursday, 13 May 2027, 2027-05-28 minus 15 days')
    expect(breakdownObj.finalMtdBreakdown).toBe('Friday, 27 November 2026, 2026-12-12 minus 15 days')
    expect(breakdownObj.mtdBreakdown).toBe(
      'Saturday, 12 December 2026, 167 days from the beginning of the sentence (2026-06-29)',
    )
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

    const { breakdownObj: notCalculatedBreakdown } = new CalculationResultPresenter().present(result)

    expect(notCalculatedBreakdown.etdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedBreakdown.ltdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')

    const { resultDates: notCalculatedDates } = new CalculationResultPresenter().present(result)
    expect(notCalculatedDates.etd).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedDates.ltd).toBe('Not applicable for DTOs with terms less than 8 months')
  })

  it('formats dates that arrive as JSON-serialized strings', () => {
    const fromApi = JSON.parse(JSON.stringify(sampleCalculationResult)) as OutputCalculation

    const {
      breakdownObj: apiBreakdown,
      termDates: apiTermDates,
      resultDates: apiResultDates,
    } = new CalculationResultPresenter().present(fromApi)

    expect(apiBreakdown).toEqual(breakdownObj)
    expect(apiTermDates).toEqual(termDates)
    expect(apiResultDates).toEqual(resultDates)
  })
})

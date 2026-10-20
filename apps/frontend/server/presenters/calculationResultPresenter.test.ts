import { DtoEligibilityStatus, OutputCalculation } from '@yjb-platform/shared-types'
import CalculationResultPresenter from './calculationResultPresenter'
import { sampleCalculationResult } from '../testutils/sampleObjects'

describe('calculationResultPresenter', () => {
  const { breakdownObj, termDates, resultDates, periods } = new CalculationResultPresenter().present(
    sampleCalculationResult,
  )

  it('formats the term length, custodial period and remand period', () => {
    expect(periods).toEqual({
      termLength: '11 months (334 days)',
      custodialPeriod: '167 days',
      remandPeriod: '15 days',
    })
  })

  it('says "1 day" rather than "1 days" for a single day of remand', () => {
    const oneDayOfRemand: OutputCalculation = { ...sampleCalculationResult, remandPeriodDays: 1 }

    expect(new CalculationResultPresenter().present(oneDayOfRemand).periods.remandPeriod).toBe('1 day')
  })

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

  it.each([
    [334, 'Term length (334) / 2'],
    [333, 'Term length (333) / 2 and rounded up'],
  ])('explains the custodial period for a term of %s days as "%s"', (totalDaysInTerm: number, expected: string) => {
    expect(new CalculationResultPresenter().formatCustodialPeriodBreakdown(totalDaysInTerm)).toBe(expected)
  })

  it('formats the term length breakdown with the sentence start and SLED dates', () => {
    expect(breakdownObj.termLengthBreakdown).toBe('from 29 June 2026 to 13 May 2027')
  })

  it('splits the MTD, SLED and final MTD into the date and the explanation', () => {
    expect(breakdownObj.mtdDate).toBe('Saturday, 12 December 2026')
    expect(breakdownObj.mtdBreakdown).toBe(
      '167 days (custodial period) from the beginning of the sentence (29 June 2026)',
    )
    expect(breakdownObj.finalSledDate).toBe('Thursday, 13 May 2027')
    expect(breakdownObj.finalSledBreakdown).toBe('28 May 2027 minus 15 days')
    expect(breakdownObj.finalMtdDate).toBe('Friday, 27 November 2026')
    expect(breakdownObj.finalMtdBreakdown).toBe('12 December 2026 minus 15 days')
  })

  it('splits the ETD and LTD into the date and the explanation', () => {
    expect(breakdownObj.etdDate).toBe('Tuesday, 27 October 2026')
    expect(breakdownObj.etdBreakdown).toBe('1 month away from the MTD for DTOs with terms from 8 to 18 months')
    expect(breakdownObj.ltdDate).toBe('Sunday, 27 December 2026')
    expect(breakdownObj.ltdBreakdown).toBe('1 month away from the MTD for DTOs with terms from 8 to 18 months')
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

    expect(notCalculatedBreakdown.etdDate).toBe('')
    expect(notCalculatedBreakdown.etdBreakdown).toBe('Not applicable for DTOs with terms less than 8 months')
    expect(notCalculatedBreakdown.ltdDate).toBe('')
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

import { OutputCalculation, calcBreakdown, AdjustmentTypes } from '@yjb-platform/shared-types'

export type CalculationResutlObj = {
  breakdownObj: calcBreakdown
  calculationResultString: string
}

type DateMetadata = { dayOfWeek?: string; message: string }

export default class CalculationResultPresentent {
  constructor(private readonly calculationResult: OutputCalculation) {}

  prensent(): CalculationResutlObj {
    const { calculatedTerms, effectiveDates, effectiveDatesPastAdjustments, etd, ltd } = this.calculationResult
    const term = calculatedTerms[0]

    const remandAdjustmentRecord = effectiveDatesPastAdjustments[0]
    const remandBreakdown =
      remandAdjustmentRecord?.adjustmentParameters.name === AdjustmentTypes.remand
        ? `(${this.formatUkDate(remandAdjustmentRecord.adjustmentParameters.startDate)} to ${this.formatUkDate(
            new Date(new Date(term.inputSentence.from).getTime() - 24 * 60 * 60 * 1000),
          )})`
        : ''

    const breakdownObj: calcBreakdown = {
      custodialPeriodBreakdown: `${term.totalDaysInTerm} divided by 2${term.totalDaysInTerm % 2 ? ', rounded up' : ''}`,
      remandPeriodBreakdown: remandBreakdown,
      sledBreakdown: this.formatDateBreakdown(effectiveDates.sled.data, effectiveDates.sled.metadata),
      finalMtdBreakdown: this.formatDateBreakdown(effectiveDates.mtd.data, effectiveDates.mtd.metadata),
      etdBreakdown: this.formatDateBreakdown(etd.data, etd.metadata),
      ltdBreakdown: this.formatDateBreakdown(ltd.data, ltd.metadata),
    }

    return {
      breakdownObj,
      calculationResultString: JSON.stringify(this.calculationResult),
    }
  }

  formatDateBreakdown(date: Date | string | 0, metadata: DateMetadata): string {
    return [metadata.dayOfWeek, date ? this.formatUkDate(date) : undefined, metadata.message].filter(Boolean).join(', ')
  }

  formatUkDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(date),
    )
  }
}

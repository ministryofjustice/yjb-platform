import { OutputCalculation, calcBreakdown, AdjustmentTypes } from '@yjb-platform/shared-types'

export type CalculationResutlObj = {
  breakdownObj: calcBreakdown
  termDates: { sled: string; mtd: string }
  resultDates: { sled: string; finalMtd: string; etd: string; ltd: string }
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
      termDates: {
        sled: this.formatDayAndDate(term.sled.data, term.sled.metadata),
        mtd: this.formatDayAndDate(term.mtd.data, term.mtd.metadata),
      },
      resultDates: {
        sled: this.formatDayAndDate(effectiveDates.sled.data, effectiveDates.sled.metadata),
        finalMtd: this.formatDayAndDate(effectiveDates.mtd.data, effectiveDates.mtd.metadata),
        etd: this.formatDayAndDate(etd.data, etd.metadata),
        ltd: this.formatDayAndDate(ltd.data, ltd.metadata),
      },
      calculationResultString: JSON.stringify(this.calculationResult),
    }
  }

  formatDateBreakdown(date: Date | string | 0, metadata: DateMetadata): string {
    return [metadata.dayOfWeek, date ? this.formatUkDate(date) : undefined, metadata.message].filter(Boolean).join(', ')
  }

  // e.g. "Thursday 2027-05-13" - a transfer date that wasn't calculated has data 0, so its message is shown instead
  formatDayAndDate(date: Date | string | 0, metadata: DateMetadata): string {
    if (!date) return metadata.message
    return [metadata.dayOfWeek, new Date(date).toISOString().slice(0, 10)].filter(Boolean).join(', ')
  }

  formatUkDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(date),
    )
  }
}

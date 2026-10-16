import { UTCDate } from '@date-fns/utc'
import { format, subDays } from 'date-fns'
import { OutputCalculation, calcBreakdown, AdjustmentTypes } from '@yjb-platform/shared-types'

export type CalculationResultObj = {
  breakdownObj: calcBreakdown
  termDates: { sled: string; mtd: string }
  resultDates: { finalSled: string; finalMtd: string; etd: string; ltd: string }
  calculationResultString: string
}

type DateMetadata = { dayOfWeek?: string; message: string }

export default class CalculationResultPresenter {
  constructor(private readonly calculationResult: OutputCalculation) {}

  present(): CalculationResultObj {
    const { calculatedTerms, effectiveDates, effectiveDatesPastAdjustments, etd, ltd } = this.calculationResult
    const term = calculatedTerms[0]

    const remandAdjustmentRecord = effectiveDatesPastAdjustments[0]
    const remandBreakdown =
      remandAdjustmentRecord?.adjustmentParameters.name === AdjustmentTypes.remand
        ? // remand ends the day before the sentence starts
          `(${this.formatUkDate(remandAdjustmentRecord.adjustmentParameters.startDate)} to ${this.formatUkDate(
            subDays(new UTCDate(term.inputSentence.from), 1),
          )})`
        : ''

    const breakdownObj: calcBreakdown = {
      custodialPeriodBreakdown: `${term.totalDaysInTerm} divided by 2${term.totalDaysInTerm % 2 ? ', rounded up' : ''}`,
      remandPeriodBreakdown: remandBreakdown,
      finalSledBreakdown: this.formatDateBreakdown(effectiveDates.sled.data, effectiveDates.sled.metadata),
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
        finalSled: this.formatDayAndDate(effectiveDates.sled.data, effectiveDates.sled.metadata),
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
    return [metadata.dayOfWeek, format(new UTCDate(date), 'yyyy-MM-dd')].filter(Boolean).join(', ')
  }

  formatUkDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(date),
    )
  }
}

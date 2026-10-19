import { UTCDate } from '@date-fns/utc'
import { subDays } from 'date-fns'
import { OutputCalculation, calcBreakdown, AdjustmentTypes, formatUkDate } from '@yjb-platform/shared-types'

export type CalculationResultObj = {
  breakdownObj: calcBreakdown
  termDates: { sled: string; mtd: string }
  resultDates: { finalSled: string; finalMtd: string; etd: string; ltd: string }
  calculationResultString: string
}

type DateMetadata = { dayOfWeek?: string; message: string }

export default class CalculationResultPresenter {
  present(calculationResult: OutputCalculation): CalculationResultObj {
    const { calculatedTerms, effectiveDates, effectiveDatesPastAdjustments, etd, ltd } = calculationResult
    const term = calculatedTerms[0]

    const remandAdjustmentRecord = effectiveDatesPastAdjustments[0]
    const remandBreakdown =
      remandAdjustmentRecord?.adjustmentParameters.name === AdjustmentTypes.remand
        ? // remand ends the day before the sentence starts
          `(${formatUkDate(remandAdjustmentRecord.adjustmentParameters.startDate)} to ${formatUkDate(
            subDays(new UTCDate(term.inputSentence.from), 1),
          )})`
        : ''

    const breakdownObj: calcBreakdown = {
      termLengthBreakdown: `${term.inputSentence.durationMonths} months (${term.totalDaysInTerm} days), from ${formatUkDate(
        term.inputSentence.from,
      )} to ${formatUkDate(effectiveDates.sled.data)}`,
      custodialPeriodBreakdown: `${term.totalDaysInTerm} divided by 2${term.totalDaysInTerm % 2 ? ', rounded up' : ''}`,
      remandPeriodBreakdown: remandBreakdown,
      mtdBreakdown: this.formatDateBreakdown(term.mtd.data, term.mtd.metadata),
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
      calculationResultString: JSON.stringify(calculationResult),
    }
  }

  // TODO: check what we need to see if no date (probably show a message?) and if we can combine with formatDayAndDate
  formatDateBreakdown(date: Date | string | 0, metadata: DateMetadata): string {
    return [metadata.dayOfWeek, date ? formatUkDate(date) : undefined, metadata.message].filter(Boolean).join(', ')
  }

  formatDayAndDate(date: Date | string | 0, metadata: DateMetadata): string {
    if (!date) return metadata.message
    return [metadata.dayOfWeek, date ? formatUkDate(date) : undefined].filter(Boolean).join(', ')
  }
}

import { UTCDate } from '@date-fns/utc'
import { subDays } from 'date-fns'
import { OutputCalculation, calcBreakdown, AdjustmentTypes, formatUkDate, pluralise } from '@yjb-platform/shared-types'

export type CalculationResultObj = {
  breakdownObj: calcBreakdown
  termDates: { sled: string; mtd: string }
  resultDates: { finalSled: string; finalMtd: string; etd: string; ltd: string; erd: string }
  // lengths of time as text
  periods: { termLength: string; custodialPeriod: string; remandPeriod: string }
  calculationResultString: string
}

type DateMetadata = { dayOfWeek?: string; message: string }

export default class CalculationResultPresenter {
  present(calculationResult: OutputCalculation): CalculationResultObj {
    const { calculatedTerms, effectiveDates, effectiveDatesPastAdjustments, etd, ltd, erd } = calculationResult
    const term = calculatedTerms[0]

    const remandAdjustmentRecord = effectiveDatesPastAdjustments[0]
    const remandBreakdown =
      remandAdjustmentRecord?.adjustmentParameters.name === AdjustmentTypes.remand
        ? // remand ends the day before the sentence starts
          `${formatUkDate(remandAdjustmentRecord.adjustmentParameters.startDate)} to ${formatUkDate(
            subDays(new UTCDate(term.inputSentence.from), 1),
          )}`
        : ''

    const breakdownObj: calcBreakdown = {
      termLengthBreakdown: `from ${formatUkDate(term.inputSentence.from)} to ${formatUkDate(effectiveDates.sled.data)}`,
      custodialPeriodBreakdown: this.formatCustodialPeriodBreakdown(term.totalDaysInTerm),
      remandPeriodBreakdown: remandBreakdown,
      mtdDate: this.formatDateLine(term.mtd.data, term.mtd.metadata),
      mtdBreakdown: term.mtd.metadata.message,
      finalSledDate: this.formatDateLine(effectiveDates.sled.data, effectiveDates.sled.metadata),
      finalSledBreakdown: effectiveDates.sled.metadata.message,
      finalMtdDate: this.formatDateLine(effectiveDates.mtd.data, effectiveDates.mtd.metadata),
      finalMtdBreakdown: effectiveDates.mtd.metadata.message,
      etdDate: this.formatDateLine(etd.data, etd.metadata),
      etdBreakdown: etd.metadata.message,
      ltdDate: this.formatDateLine(ltd.data, ltd.metadata),
      ltdBreakdown: ltd.metadata.message,
      erdDate: this.formatDateLine(erd.data, erd.metadata),
      erdBreakdown: erd.metadata.message,
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
        erd: this.formatDayAndDate(erd.data, erd.metadata),
      },
      periods: {
        termLength: `${term.inputSentence.durationMonths} months (${pluralise(term.totalDaysInTerm, 'day')})`,
        custodialPeriod: pluralise(term.totalDaysMTD, 'day'),
        remandPeriod: pluralise(calculationResult.remandPeriodDays, 'day'),
      },
      calculationResultString: JSON.stringify(calculationResult),
    }
  }

  // the custodial period is half the term, e.g. "Term length (334) / 2" - a term with an odd number of
  // days can't be halved exactly, e.g. "Term length (333) / 2 and rounded up"
  formatCustodialPeriodBreakdown(totalDaysInTerm: number): string {
    const breakdown = `Term length (${totalDaysInTerm}) / 2`

    const hasOddNumberOfDays = totalDaysInTerm % 2 === 1
    if (hasOddNumberOfDays) {
      return `${breakdown} and rounded up`
    }

    return breakdown
  }

  // the first line of a date row in the breakdown, e.g. "Saturday, 12 December 2026" - empty when there is
  // no date (e.g. an ETD that wasn't calculated), as the second line then explains why
  formatDateLine(date: Date | string | 0, metadata: DateMetadata): string {
    if (!date) {
      return ''
    }

    return [metadata.dayOfWeek, formatUkDate(date)].filter(Boolean).join(', ')
  }

  formatDayAndDate(date: Date | string | 0, metadata: DateMetadata): string {
    if (!date) return metadata.message
    return [metadata.dayOfWeek, date ? formatUkDate(date) : undefined].filter(Boolean).join(', ')
  }
}

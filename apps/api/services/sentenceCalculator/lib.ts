import { UTCDate } from '@date-fns/utc'
import { addMonths, addDays, subDays, subMonths, differenceInCalendarDays } from 'date-fns'
import {InputIndividualSentence} from './types'

export function getTotalDaysInTerm(sentenceInput: InputIndividualSentence): number {
    const utcFrom = new UTCDate(sentenceInput.from)
    const to = addMonths(utcFrom, sentenceInput.durationMonths)

    return differenceInCalendarDays(to, utcFrom)
}

export function getTotalDaysMTD(totalDaysInTerm: number): number {
    return Math.round(totalDaysInTerm / 2)
}

export function increaseDateWithDays(daysToAdd: number, dateToIncrease: Date): Date {
    return addDays(new UTCDate(dateToIncrease), daysToAdd - 1)
}

export function increaseTotalNumRTBDays(currentTotal: number, incrementor: number): number {
    return currentTotal + incrementor
}

export function  getETDDate(mtd: Date, sentenceLenth: number): Date | 0 {
    if(sentenceLenth > 8 && sentenceLenth < 18 ){
        return subMonths(new UTCDate(mtd), 1)
    }else if(sentenceLenth > 18){
        return subMonths(new UTCDate(mtd), 2)
    }
    // not eligible: sentence is less than 8 months
    return 0
  }

export function  getLTDDate(mtd: Date, sentenceLenth: number): Date | 0 {
     if(sentenceLenth > 8 && sentenceLenth < 18 ){
        return addMonths(new UTCDate(mtd), 1)
    }else if(sentenceLenth > 18){
        return addMonths(new UTCDate(mtd), 2)
    }
    // not eligible: sentence is less than 8 months
    return 0
  }
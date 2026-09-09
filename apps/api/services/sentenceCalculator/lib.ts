import { UTCDate } from '@date-fns/utc'
import { addMonths, addDays, subDays, subMonths, differenceInCalendarDays } from 'date-fns'
import {InputIndividualSentence} from './types'

export function getTotalDaysInTerm(sentenceInput: InputIndividualSentence): number {
    const utcFrom = new UTCDate(sentenceInput.from)
    const to = addMonths(utcFrom, sentenceInput.durationMonths)
    
    return differenceInCalendarDays(to, utcFrom)
  }
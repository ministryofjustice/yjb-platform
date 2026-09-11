import { InputSentences, OutputCalculation, EffectiveDates } from './types'
import {
  getTotalDaysInTerm,
  addDaysToDate,
  getTotalDaysMTD,
  increaseTotalNumRTBDays,
  getETDDate,
  getLTDDate,
  adjustCalculation,
  calculateTerm
} from './lib'
export function calculateDTOSentence(inputSentence: InputSentences): OutputCalculation {
    let outputCalculation: OutputCalculation = {
        calculatedTerms: [],
        effectiveDates: {} as EffectiveDates,
        effectiveDatesPastAdjustments: [],
        ltd: new Date(0),
        etd: new Date(0),
    }
    

     // get all term dates, for now it will always be one
    inputSentence.inputIndividualSentences.forEach(inputSentence => {
      outputCalculation.calculatedTerms.push(calculateTerm(inputSentence))
    })

      // for now 1 sentecen only and without any adjustemnts the effecive dates match the terms (to apply consecuteve concurent sentences in future)
    outputCalculation.effectiveDates = {
      // TODO calculate the real total
      totalNumberOfRemandAndTaggedBailDays: 0,
      sled: outputCalculation.calculatedTerms[0].sled,
      mtd: outputCalculation.calculatedTerms[0].mtd,
      // probably out of scope for now, leve just for consistancy with sheet
      TUSED: new Date(0),
    }

    if(inputSentence.remandAdjustment){
        adjustCalculation(outputCalculation, inputSentence.remandAdjustment)
    }

    if(inputSentence.taggedBailAdjustment){
        adjustCalculation(outputCalculation, inputSentence.taggedBailAdjustment)
    }

    outputCalculation.ltd = getLTDDate(
      outputCalculation.effectiveDates.mtd,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )
    outputCalculation.etd = getETDDate(
     outputCalculation.effectiveDates.mtd,
      inputSentence.inputIndividualSentences[0].durationMonths,
    )

    return outputCalculation
}
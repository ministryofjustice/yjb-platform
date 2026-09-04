import { InputSentences, OutputCalculation, AdjustmentTypes } from '../services/sentenceCalculator/types'
import SentenceCalculator from '../services/sentenceCalculator/SentenceCalculator'

// TODO: extract this in parser class which also does simple validation use zod
export default function sentenceCalculatorController(sentence: InputSentences): OutputCalculation {
    
    //TODO replace this temp deserislizing witg zod
    sentence.inputIndividualSentences = sentence.inputIndividualSentences.map(term => ({
        ...term,
        from: new Date(term.from),
    }))

    //conditionally deserialises
  if (sentence.remandAdjustment) {
    sentence.remandAdjustment = {
      ...sentence.remandAdjustment,
      startDate: new Date(sentence.remandAdjustment.startDate),
    }
  }
  
  const sentenceCalc = new SentenceCalculator(sentence)
  if ((sentence.remandAdjustment?.days ?? 0) > 0) {
    sentenceCalc.adjustCalculation(AdjustmentTypes.remand)
  }
  return sentenceCalc.getCalculation()
}

import { InputSentences, AdjustmentTypes } from "../services/sentenceCalculator/types";
import SentenceCalculator from "../services/sentenceCalculator/SentenceCalculator"

export class SentenceCalculatorController{
    constructor (sentence: InputSentences) {
        
        // TODO: extract this in parser class which also does simple validation
        const sentenceCalc = new SentenceCalculator(sentence)
        if ((sentence.remandAdjustment?.days ?? 0) > 0) {
            sentenceCalc.adjustCalculation(AdjustmentTypes.remand);
        }
        const finalCalObj = sentenceCalc.getCalculation();
        return finalCalObj;
    }
}

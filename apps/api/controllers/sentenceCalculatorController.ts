import { InputSentences, AdjustmentTypes } from "../services/sentenceCalculator/types";
import SentenceCalculator from "../services/sentenceCalculator/SentenceCalculator"

export class SentenceCalculatorController{
    constructor (sentence: InputSentences) {
        const sentenceCalc = new SentenceCalculator(sentence)
        if(sentence.inputAdjustments.remand > 0){
            sentenceCalc.adjustCalculation(AdjustmentTypes.remand);
        }
        const finalCalObj = sentenceCalc.getCalculation();
        return finalCalObj;
    }
}

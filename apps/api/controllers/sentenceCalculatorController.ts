import { Sentence, Reason } from "../services/sentenceCalculator/types";
import SentenceCalculator from "../services/sentenceCalculator/SentenceCalculator"

export class SentenceCalculatorController{
    constructor (sentence: Sentence) {
        const sentenceCalc = new SentenceCalculator(sentence)
        if(sentence.term[0].remand > 0){
            sentenceCalc.adjustCalculation(Reason.remand);
        }
        const finalCalObj = sentenceCalc.getCalculation();
        return finalCalObj;
    }
}
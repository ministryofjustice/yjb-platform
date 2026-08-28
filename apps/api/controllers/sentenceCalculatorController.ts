import { Sentence } from "../services/sentenceCalculator/types";
import SentenceCalculator from '../services/SentenceCalculator/sentenceCalculator'

export class SentenceCalculatorController{
    adjustementController(sentence: Sentence) {
        const sentenceCalc = new SentenceCalculator(sentence)
        return sentenceCalc;
    }
}
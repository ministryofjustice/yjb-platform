import {Sentence, Calculation} from "../services/sentenceCalculator/types"
import SentenceCalculator from "../services/sentenceCalculator/SentenceCalculator";
import { SentenceCalculatorController } from "./sentenceCalculatorController";

describe('SentenceController', () => {
    it('returns calculation for sled and mtd with no remand', () => {
        const inputSentence: Sentence = {
            'offenderName': 'test Offender',
            'term': [{
                from: new Date('2026-06-29'),
                durationMonths: 11,
                remand: 0,
            }]
        }
        const outputCalculation:Calculation = {
            totalDaysInTerm: 334,
            effectiveSled: new Date('2027-05-28'),
            totalDaysMTD: 167,
            effectiveMTD: new Date('2026-12-12'),
            // ETD/LTD placeholder
            effectiveLTD: expect.any(Date),
            effectiveETD: expect.any(Date),
            adjustmentRecords: [],
        }
        const calculator = new SentenceCalculator(inputSentence)
        expect(calculator.getCalculation()).toEqual(outputCalculation)
    })
})


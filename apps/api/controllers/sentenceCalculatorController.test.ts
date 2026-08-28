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
            totalDaysMTD: 167,
            effectiveDates: {
                sled: new Date('2027-05-28'),
                mtd: new Date('2026-12-12'),
                // ETD/LTD placeholder
                ltd: expect.any(Date),
                etd: new Date('2026-11-12'),
            },
            adjustmentRecords: [],
        }
        const calculator = new SentenceCalculator(inputSentence)
        expect(calculator.getCalculation()).toEqual(outputCalculation)
    })
})


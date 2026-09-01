import {Sentence, Calculation, Reason} from "../services/sentenceCalculator/types"
import { SentenceCalculatorController } from "./sentenceCalculatorController";

describe('SentenceController', () => {
    it('returns 2027-05-28 sled and 2026-12-12 mtd for 11 month sentence starting on 026-06-29 with no remand', () => {
        const inputSentence: Sentence = {
            'offenderName': 'test Offender',
            'term': [{
                from: new Date('2026-06-29'),
                durationMonths: 11,
                remand: 0,
            }]
        }
        const expectedOutputCalculation:Calculation = {
            totalDaysInTerm: 334,
            totalDaysMTD: 167,
            effectiveDates: {
                sled: new Date('2027-05-28'),
                mtd: new Date('2026-12-12'),
                ltd: new Date('2027-01-12'),
                etd: new Date('2026-11-12'),
            },
            pastAdjustements: [],
        }
        const calculatedCalulationObj = new SentenceCalculatorController(inputSentence);
        expect(calculatedCalulationObj).toEqual(expectedOutputCalculation)
    })

    it('returns seld 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 15 days remand', () => {
        const inputSentence: Sentence = {
            offenderName: 'Test Offender',
            term: [
                {
                    from: new Date('2026-06-29'),
                    durationMonths: 11,
                    remand: 15,
                },
            ],
        }

       const expectedOutputCalculation = {
            totalDaysInTerm: 334,
            totalDaysMTD: 167,
             effectiveDates: {
                sled: new Date('2027-05-13'),
                mtd: new Date('2026-11-27'),
                ltd: new Date('2026-12-27'),
                etd: new Date('2026-10-27'),
            },
        pastAdjustements: [{ type: 'remand', oldSled: new Date('2027-05-28'), oldMtd: new Date('2026-12-12') }],
        }
        const calculatedCalulationObj = new SentenceCalculatorController(inputSentence);
        expect(calculatedCalulationObj).toEqual(expectedOutputCalculation)

    })
})


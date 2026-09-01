import {InputSentences, OutputCalculation, AdjustmentTypes} from "../services/sentenceCalculator/types"
import { SentenceCalculatorController } from "./sentenceCalculatorController";

describe('SentenceController', () => {
    it('returns 2027-05-28 sled and 2026-12-12 mtd for 11 month sentence starting on 026-06-29 with no remand', () => {
        const inputSentence: InputSentences = {
            'offenderName': 'test Offender',
            inputAdjustments: {
                remand: 0,
                remandStartDate: new Date(),
                taggedBailDays: 0,
            },
            'inputIndividualSentences': [{
                from: new Date('2026-06-29'),
                durationMonths: 11,
            }]
        }
        const expectedOutputCalculation:OutputCalculation = {
            caluclatedTerms: [
                {
                    inputSentece: { from: new Date('2026-06-29'), durationMonths: 11 },
                    totalDaysInTerm: 334,
                    totalDaysMTD: 167,
                    sled: new Date('2027-05-28'),
                    mtd: new Date('2026-12-12'),
                },
            ],
            effectiveDates: {
                sled: new Date('2027-05-28'),
                mtd: new Date('2026-12-12'),
                ltd: new Date('2027-01-12'),
                etd: new Date('2026-11-12'),
            },
            pastCalculations: [],
        }
        const calculatedCalulationObj = new SentenceCalculatorController(inputSentence);
        expect(calculatedCalulationObj).toEqual(expectedOutputCalculation)
    })

    it('returns seld 2027-05-13 and mtd 2026-11-2 for 11 month sentence starting on 2026-06-29 with 15 days remand', () => {
        const inputSentence: InputSentences = {
            offenderName: 'Test Offender',
            inputAdjustments: {
                remand: 15,
                remandStartDate: new Date('2026-06-14'),
                taggedBailDays: 0,
            },
            inputIndividualSentences: [
                {
                    from: new Date('2026-06-29'),
                    durationMonths: 11,
                },
            ],
        }

       const expectedOutputCalculation = {
            caluclatedTerms: [
                {
                    inputSentece: { from: new Date('2026-06-29'), durationMonths: 11 },
                    totalDaysInTerm: 334,
                    totalDaysMTD: 167,
                    sled: new Date('2027-05-28'),
                    mtd: new Date('2026-12-12'),
                },
            ],
             effectiveDates: {
                sled: new Date('2027-05-13'),
                mtd: new Date('2026-11-27'),
                ltd: new Date('2026-12-27'),
                etd: new Date('2026-10-27'),
            },
        pastCalculations: [{ adjustmentReason: 'remand', oldSled: new Date('2027-05-28'), oldMtd: new Date('2026-12-12') }],
        }
        const calculatedCalulationObj = new SentenceCalculatorController(inputSentence);
        expect(calculatedCalulationObj).toEqual(expectedOutputCalculation)

    })

})


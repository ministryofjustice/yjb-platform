import * as cheerio from 'cheerio'
import createNunjucksTestSetup from '../../testutils/nunjucksSetup'
import { CalculationResult } from '../../types/calculationResult'
import {OutputCalculation} from "../../types/dtoTypes";

const env = createNunjucksTestSetup()
const renderWithCheerio = (context = {}) => cheerio.load(env.render('pages/calculation-breakdown.njk', context))

describe('Calculation breakdown page', () => {
  it('renders the title', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('title').text()).toBe('Youth Justice Platform - Calculation breakdown')
  })

  it('renders the page heading', () => {
    const cheerioPage = renderWithCheerio()
    expect(cheerioPage('h1').text()).toBe('Calculation breakdown')
  })
})

// const sampleCalculationResult: OutputCalculation = {
//   caluclatedTerms: [
//     {
//       inputSentece: {
//         from: new Date("2026-06-29"),
//         durationMonths: 11
//       },
//     totalDaysInTerm: 334,
//     totalDaysMTD: 167,
//     sled: new Date("2027-05-28"),
//     mtd: new Date("2026-12-12")
//     }
//   ],
//   effectiveDates: {
//     totalNumberOfRemandAndTaggedBailDays: 0,
//     sled: new Date("2027-05-13"),
//     mtd: new Date("2026-11-27"),
//     TUSED: new Date("1970-01-01")
//   },
//   effectiveDatesAdjustments: [
//     {
//       adjustmentReason: "remand",
//       adjustmentParameters: {
//         remand: 15,
//         remandStartDate: new Date("2026-06-14"),
//         taggedBailDays: 0
//       },
//       pastEffectiveDates: {
//         totalNumberOfRemandAndTaggedBailDays: 0,
//         sled: new Date("2027-05-28"),
//         mtd: new Date("2026-12-12"),
//         TUSED: new Date("1970-01-01")
//       }
//     }
//   ],
//   ltd: new Date("2026-12-27"),
//   etd: new Date("2026-10-27")
// }

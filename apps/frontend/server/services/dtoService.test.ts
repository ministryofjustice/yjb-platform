import { InputSentences } from '@yjb-platform/shared-types'
import DtoService, {ParsedDtoForm, parseDtoForm, ValidationResult} from './dtoService'
import YjbApiClient from '../data/yjbApi'

jest.mock('../data/yjbApi')

const yjbApiClient = new YjbApiClient() as jest.Mocked<YjbApiClient>

const exampleValidPayload: Record<string, unknown> = {
  'sentence-length-months': 4,
  'sentence-date-year': 1990,
  'sentence-date-month': 5,
  'sentence-date-day': 14,
}


describe('parseDtoForm', () =>{
  it('should handle valid input data correctly', () => {
    const expectedParseResult: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: 0,
      sentenceLengthMonths: 4,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    const result = parseDtoForm(exampleValidPayload)
    expect(result).toEqual(expectedParseResult)
  })

  it('should handle bad sentenceDate gracefully', () => {
    const badYearPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-year': -0.444467,
    }
    const badMonthPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-month': -0.444467,
    }
    const thirteenthMonthPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-month': 13,
    }
    const negativeMonthPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-month': -1,
    }
    const badDayPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-day': -0.444467,
    }
    const thirtySecondDayPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-day': 32,
    }
    const negativeDayPayload: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-date-day': -1,
    }
    const expectedParseResult: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: 0,
      sentenceLengthMonths: 4,
      sentenceDate: undefined,
      sentenceDateString: undefined,
    }
    expect(parseDtoForm(badYearPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(badMonthPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(thirteenthMonthPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(negativeMonthPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(badDayPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(thirtySecondDayPayload)).toEqual(expectedParseResult)
    expect(parseDtoForm(negativeDayPayload)).toEqual(expectedParseResult)
  })

  it('should handle bad remandDays gracefully', () => {
    const badRemandPayload1: Record<string, unknown> = {
      ...exampleValidPayload,
      'remand-days': -0.34567,
    }
    const expectedParseResult1: ParsedDtoForm = {
      remandDays: -0.34567,
      taggedBailDays: 0,
      sentenceLengthMonths: 4,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badRemandPayload1)).toEqual(expectedParseResult1)

    const badRemandPayload2: Record<string, unknown> = {
      ...exampleValidPayload,
      'remand-days': "I don't like to eat chocolate",
    }
    const expectedParseResult2: ParsedDtoForm = {
      remandDays: NaN,
      taggedBailDays: 0,
      sentenceLengthMonths: 4,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badRemandPayload2)).toEqual(expectedParseResult2)
  })

  it('should handle bad taggedBailDays gracefully', () => {
    const badTaggedBailPayload1: Record<string, unknown> = {
      ...exampleValidPayload,
      'tagged-bail-days': -0.34567,
    }
    const expectedParseResult1: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: -0.34567,
      sentenceLengthMonths: 4,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badTaggedBailPayload1)).toEqual(expectedParseResult1)

    const badTaggedBailPayload2: Record<string, unknown> = {
      ...exampleValidPayload,
      'tagged-bail-days': "I don't like to eat chocolate",
    }
    const expectedParseResult2: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: NaN,
      sentenceLengthMonths: 4,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badTaggedBailPayload2)).toEqual(expectedParseResult2)
  })

  it('should handle bad sentenceLength gracefully', () => {
    const badSentenceLengthPayload1: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-length-months': -0.34567,
    }
    const expectedParseResult1: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: 0,
      sentenceLengthMonths: -0.34567,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badSentenceLengthPayload1)).toEqual(expectedParseResult1)

    const badSentenceLengthPayload2: Record<string, unknown> = {
      ...exampleValidPayload,
      'sentence-length-months': "I don't like to eat chocolate",
    }
    const expectedParseResult2: ParsedDtoForm = {
      remandDays: 0,
      taggedBailDays: 0,
      sentenceLengthMonths: NaN,
      sentenceDate: new Date(Date.UTC(1990, 4, 14)),
      sentenceDateString: "14/05/1990",
    }
    expect(parseDtoForm(badSentenceLengthPayload2)).toEqual(expectedParseResult2)
  })
})

describe('DtoService', () => {
  let dtoService: DtoService

  beforeEach(() => {
    dtoService = new DtoService(yjbApiClient)
  })

  describe('validatePayload', () => {
    it('should return isValid false when no payload is not provided', () => {
      const result = dtoService.validatePayload({})
      expect(result.isValid).toBe(false)
    })

    describe('for sentence length', () => {
      it.each([0, -1, -12, 0.5, 3, 11.5])('should return isValid = false with an error object with a message about the sentence length field for sentence length %s', (months) => {
        const payload: Record<string, unknown> = {
          ...exampleValidPayload,
          'sentence-length-months': months,
        }
        const expectedErrors: Record<string, string> = {
          sentenceLengthMonths: "Sentence length must be a whole number of 4 months or more"
        }
        const result: ValidationResult = dtoService.validatePayload(payload)
        expect(result.isValid).toBe(false)
        expect(result.errors).toEqual(expectedErrors)
      })

      it.each([4, 6, 11, 24])('should return isValid true for sentence length %s', months => {
        const payload: Record<string, unknown> = {
          ...exampleValidPayload,
          'sentence-length-months': months,
        }
        expect(dtoService.validatePayload(payload).isValid).toBe(true)
      })
    })

    describe('for remand days', () => {
      it('should return isValid true when remand days is not provided', () => {
        const result = dtoService.validatePayload(exampleValidPayload)
        expect(result.isValid).toBe(true)
      })

      it.each([-1, -12, 0.5, 11.5])('should return isValid = false with an error object with a message about the remand days field for sentence length %s', (remandDays) => {
        const payload: Record<string, unknown> = {
          ...exampleValidPayload,
          'remandDays': remandDays,
        }
        const expectedErrors: Record<string, string> = {
          remandDays: "Remand days must be a whole number of 0 days or more"
        }
        const result: ValidationResult = dtoService.validatePayload(payload)
        expect(result.isValid).toBe(false)
        expect(result.errors).toEqual(expectedErrors)
      })

      it.each([0, 1, 4, 6, 11, 24, 4000])('should return isValid true for remand days %s', remandDays => {
        const payload: Record<string, unknown> = {
          ...exampleValidPayload,
          'remandDays': remandDays,
        }
        expect(dtoService.validatePayload(payload).isValid).toBe(true)
      })
    })

    it('should return the raw form data as input', () => {
      const inputData: Record<string, unknown> = { 'some-field': 'some-value' }
      expect(dtoService.validatePayload(inputData).input).toBe(inputData)
    })

    it('should return a payload only when valid', () => {
      expect(dtoService.validatePayload({}).payload).toBeUndefined()
      expect(dtoService.validatePayload(exampleValidPayload).payload).toBeDefined()
    })

    it('should return the parsed form data as parsedInput only when valid', () => {
      const payload: Record<string, unknown> = {
        'sentence-length-months': 4,
        'sentence-date-year': 1990,
        'sentence-date-month': 5,
        'sentence-date-day': 14,
      }
      const expectedParsedInput: ParsedDtoForm = {
        remandDays: 0,
        taggedBailDays: 0,
        sentenceLengthMonths: 4,
        sentenceDate: new Date(Date.UTC(1990, 4, 14)),
        sentenceDateString: '14/05/1990',
      }
      expect(dtoService.validatePayload(payload).parsedInput).toEqual(expectedParsedInput)
      expect(dtoService.validatePayload({}).parsedInput).toBeUndefined()
    })

    it('should populate inputIndividualSentences in the payload from sentence-length-months and sentence-date', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'sentence-length-months': 4,
        'sentence-date-day': '11',
        'sentence-date-month': '2',
        'sentence-date-year': '2054',
      }

      const payload: ValidationResult = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          inputIndividualSentences: [{ from: new Date(2054, 1, 11), durationMonths: 4 }],
        }),
      )
    })

    it('should include taggedBailAdjustment in the payload when tagged-bail-days is provided', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'tagged-bail-days': 3,
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          taggedBailAdjustment: { name: 'taggedBail', days: 3 },
        }),
      )
    })

    it('should include remandAdjustment in the payload when remand-days is provided', () => {
      const inputData: Record<string, unknown> = {
        ...exampleValidPayload,
        'remand-days': 5,
      }

      const { payload } = dtoService.validatePayload(inputData)

      expect(payload).toEqual(
        expect.objectContaining({
          remandAdjustment: expect.objectContaining({ name: 'remand', days: 5 }),
        }),
      )
    })
  })

  describe('calculateDTO', () => {
    it('should return expected OutputCalculation object', () => {
      const inputData: InputSentences = {
        offenderName: 'William Gates',
        inputIndividualSentences: [],
      }

      dtoService.calculateDtoSentence(inputData)

      expect(yjbApiClient.calculateDtoSentence).toHaveBeenCalledWith(inputData)
    })
  })
})

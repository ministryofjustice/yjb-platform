import { InputSentences } from '@yjb-platform/shared-types'

export const sampleInputSentences: InputSentences = {
  offenderName: 'Test Offender',
  erdEligible: true,
  inputIndividualSentences: [
    {
      from: new Date('2026-06-29'),
      durationMonths: 11,
    },
  ],
}

// the same input as it arrives over HTTP, with dates as plain YYYY-MM-DD strings
export const sampleInputSentencesBody = {
  offenderName: 'Test Offender',
  erdEligible: true,
  inputIndividualSentences: [
    {
      from: '2026-06-29',
      durationMonths: 11,
    },
  ],
}

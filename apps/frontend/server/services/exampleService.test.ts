import ExampleService from './exampleService'

describe('ExampleService', () => {
  let exampleService: ExampleService

  beforeEach(() => {
    exampleService = new ExampleService()
  })

  it('should return current date/time as part of a string', () => {
    const now = new Date()

    const time = now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    const date = now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const result = exampleService.getCurrentTime().toString()

    expect(result).toBe(`${time} on ${date}`)
  })
})

import ExampleService from './exampleService'

describe('ExampleService', () => {
  let exampleService: ExampleService

  beforeEach(() => {
    exampleService = new ExampleService()
  })

  it('should return current time as string', () => {
    const before = Date.now()
    const result = exampleService.getCurrentTime()
    const after = Date.now()

    expect(new Date(result).getTime()).toBeGreaterThanOrEqual(before)
    expect(new Date(result).getTime()).toBeLessThanOrEqual(after)
  })
})

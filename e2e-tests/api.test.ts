describe('API container', () => {
  it('GET /ping returns 200', async () => {
    const res = await fetch('http://localhost:3001/ping')
    expect(res.status).toBe(200)
  })
})

describe('Docker inner communication', () => {
  //force frontend to get data
  it('frontend proxy returns data from within the API container', async () => {
    const res = await fetch('http://localhost:3000/api-test-proxy')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ name: 'test-name' })
  })
})

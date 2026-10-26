import request from 'supertest'
import express from 'express'
import zlib from 'node:zlib'
import setUpWebRequestParsing from './setupRequestParsing'

const handler = jest.fn((req: express.Request, res: express.Response) => {
  res.status(200).json(req.body)
})

const app = express()
app.use(setUpWebRequestParsing())
app.post('/echo', handler)

const jsonBody = JSON.stringify({ name: 'test-name' })
const formBody = 'name=test-name'

beforeEach(() => {
  handler.mockClear()
})

describe('setUpWebRequestParsing', () => {
  it('should parse an uncompressed JSON body', () => {
    return request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .send(jsonBody)
      .expect(200, { name: 'test-name' })
  })

  it('should parse an uncompressed urlencoded body', () => {
    return request(app)
      .post('/echo')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(formBody)
      .expect(200, { name: 'test-name' })
  })

  // CVE-2026-111497: compressed bodies must never reach the zlib decoder
  it.each([
    ['br', zlib.brotliCompressSync],
    ['gzip', zlib.gzipSync],
    ['deflate', zlib.deflateSync],
  ])('should reject a %s-encoded JSON body with 415', async (encoding, compress) => {
    await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', encoding)
      .send(compress(Buffer.from(jsonBody)))
      .expect(415)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should reject a br-encoded urlencoded body with 400', async () => {
    await request(app)
      .post('/echo')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Content-Encoding', 'br')
      .send(zlib.brotliCompressSync(Buffer.from(formBody)))
      .expect(400)

    expect(handler).not.toHaveBeenCalled()
  })
})
